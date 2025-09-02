import { NextResponse, NextRequest } from "next/server";
import { ResultSetHeader, RowDataPacket, FieldPacket } from "mysql2/promise";
import pool from "@/lib/db/mysql";
import logger from "@/lib/logger";
import { RateLimiter, sanitizeHtml } from "@/lib/validation";
import { createSuccessResponse, getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { DatabaseError, ApiError, ValidationError, RateLimitError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";
import redis from "@/lib/db/redis";

// Rate limiting for form submissions - 5 questions per 5 minutes per IP
const questionSubmissionLimit = new RateLimiter(5, 5 * 60 * 1000);
// Rate limiting for viewing questions - 100 requests per minute per IP  
const questionViewLimit = new RateLimiter(100, 60 * 1000);

interface QuestionRow extends RowDataPacket {
  Id: number;
  Title: string;
  Name: string;
  ViewCount: number;
  AnswerCount: number;
  CreatedAt: string;
}

interface QuestionSubmission {
  name: string;
  memberNumber: string;
  title: string;
  body: string;
}

// Input validation helpers
function validateMemberNumber(memberNumber: string): boolean {
  return /^\d{6,10}$/.test(memberNumber); // 6-10 digits
}

function validateName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Zก-๙\s]+$/.test(name);
}

function validateTitle(title: string): boolean {
  return title.length >= 5 && title.length <= 200;
}

function validateBody(body: string): boolean {
  return body.length >= 10 && body.length <= 2000;
}

async function questionsGetHandler(
  _request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    // Rate limiting check for viewing questions
    if (!questionViewLimit.isAllowed(context.ip)) {
      throw new RateLimitError(
        "Too many requests. Please try again later.",
        { ip: context.ip, limit: 100, window: 60000 }
      );
    }

    const cacheKey = 'questions:list';
    
    try {
      // Try to get from cache first (2 minute cache for questions)
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Questions data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult) as QuestionRow[];
        return createSuccessResponse(data, 'Questions retrieved successfully', 
          getCacheHeaders('HIT', 120, 'questions')
        );
      }
    } catch (redisError) {
      logger.warn('Redis cache error, proceeding without cache', {
        error: redisError instanceof Error ? redisError.message : String(redisError),
        requestId: context.requestId
      });
    }

    // Get database connection
    try {
      db = await pool.getConnection();
    } catch (error) {
      throw new DatabaseError(
        "Failed to connect to database",
        error instanceof Error ? error : new Error(String(error))
      );
    }

    try {
      // Fetch questions along with view count and answer count
      const [questions]: [QuestionRow[], FieldPacket[]] = await db.query(`
        SELECT 
          q.Id, 
          q.Title, 
          q.Name, 
          q.ViewCount, 
          COUNT(a.Id) AS AnswerCount,
          DATE_FORMAT(q.CreatedAt, '%Y-%m-%d %H:%i') AS CreatedAt
        FROM questions q
        LEFT JOIN answers a ON q.Id = a.QuestionId
        GROUP BY q.Id, q.Title, q.Name, q.ViewCount, q.CreatedAt
        ORDER BY q.CreatedAt DESC
        LIMIT 50
      `);
      
      // Cache the result for 2 minutes
      try {
        await redis.setex(cacheKey, 120, JSON.stringify(questions));
      } catch (redisError) {
        logger.warn('Failed to cache questions data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }
    
      logger.info('Questions data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        resultCount: questions.length,
        cacheHit: false
      });
      
      return createSuccessResponse(
        questions,
        'Questions retrieved successfully',
        getCacheHeaders('MISS', 120, 'questions')
      );
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
          throw new DatabaseError("Database connection timeout", error);
        }
        throw new DatabaseError("Database query failed", error);
      }
      throw new ApiError("Database operation failed", ApiErrorCodes.DB_ERROR, 500);
    }
    
  } catch (error) {
    logger.error('Error in questions GET handler', {
      error: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      ip: context.ip,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error; // Re-throw to be handled by middleware
  } finally {
    // Ensure database connection is released
    if (db) {
      try {
        db.release();
      } catch (error) {
        logger.warn('Error releasing database connection', {
          error: error instanceof Error ? error.message : String(error),
          requestId: context.requestId
        });
      }
    }
  }
}

async function questionsPostHandler(
  request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    // Rate limiting check for question submission
    if (!questionSubmissionLimit.isAllowed(context.ip)) {
      throw new RateLimitError(
        "Too many question submissions. Please wait 5 minutes before submitting again.",
        { ip: context.ip, limit: 5, window: 300000 }
      );
    }

    // Parse request body
    let body: QuestionSubmission;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON in request body", "body");
    }

    const { name, memberNumber, title, body: questionBody } = body;

    // Input validation
    if (!name || typeof name !== 'string') {
      throw new ValidationError("Name is required and must be a valid string", "name");
    }

    if (!memberNumber || typeof memberNumber !== 'string') {
      throw new ValidationError("Member number is required", "memberNumber");
    }

    if (!title || typeof title !== 'string') {
      throw new ValidationError("Title is required", "title");
    }

    if (!questionBody || typeof questionBody !== 'string') {
      throw new ValidationError("Question content is required", "body");
    }

    // Detailed validation
    if (!validateName(name)) {
      throw new ValidationError(
        "Name must be 2-100 characters and contain only letters and spaces",
        "name"
      );
    }

    if (!validateMemberNumber(memberNumber)) {
      throw new ValidationError(
        "Member number must be 6-10 digits",
        "memberNumber"
      );
    }

    if (!validateTitle(title)) {
      throw new ValidationError(
        "Title must be 5-200 characters long",
        "title"
      );
    }

    if (!validateBody(questionBody)) {
      throw new ValidationError(
        "Question content must be 10-2000 characters long",
        "body"
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedName = sanitizeHtml(name.trim());
    const sanitizedTitle = sanitizeHtml(title.trim());
    const sanitizedBody = sanitizeHtml(questionBody.trim());
    const sanitizedMemberNumber = memberNumber.trim();

    // Get database connection
    try {
      db = await pool.getConnection();
    } catch (error) {
      throw new DatabaseError(
        "Failed to connect to database",
        error instanceof Error ? error : new Error(String(error))
      );
    }

    try {
      // Insert into database with prepared statement
      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO questions (Name, MemberNumber, Title, Body, CreatedAt, ViewCount) VALUES (?, ?, ?, ?, NOW(), 0)",
        [sanitizedName, sanitizedMemberNumber, sanitizedTitle, sanitizedBody]
      );

      // Invalidate questions cache since we added a new question
      try {
        await redis.del('questions:list');
      } catch (redisError) {
        logger.warn('Failed to invalidate questions cache', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      const responseData = {
        id: result.insertId,
        name: sanitizedName,
        memberNumber: sanitizedMemberNumber,
        title: sanitizedTitle,
        body: sanitizedBody
      };

      logger.info('Question created successfully', {
        questionId: result.insertId,
        requestId: context.requestId,
        ip: context.ip,
        title: sanitizedTitle
      });

      return NextResponse.json(
        {
          success: true,
          data: responseData,
          message: "Question submitted successfully",
          timestamp: new Date().toISOString()
        },
        { status: 201 }
      );
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
          throw new DatabaseError("Database connection timeout", error);
        }
        throw new DatabaseError("Database operation failed", error);
      }
      throw new ApiError("Database operation failed", ApiErrorCodes.DB_ERROR, 500);
    }
    
  } catch (error) {
    logger.error('Error in questions POST handler', {
      error: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      ip: context.ip,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error; // Re-throw to be handled by middleware
  } finally {
    // Ensure database connection is released
    if (db) {
      try {
        db.release();
      } catch (error) {
        logger.warn('Error releasing database connection', {
          error: error instanceof Error ? error.message : String(error),
          requestId: context.requestId
        });
      }
    }
  }
}

export const GET = withPublicApi(questionsGetHandler);
export const POST = withPublicApi(questionsPostHandler);
