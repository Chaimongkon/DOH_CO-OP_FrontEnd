import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db/mysql';
import { withPublicApi, ApiRequestContext } from '@/lib/api-middleware';
import { sanitizeHtml } from '@/lib/validation';
import logger from '@/lib/logger';

// Database types
interface DatabaseInsertResult {
  insertId: number;
  affectedRows: number;
}


async function handleGetAnswers(request: NextRequest, context: ApiRequestContext, params: { id: string }) {
  const { id } = params;
  
  // Validate ID parameter
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid question ID format' },
      { status: 400 }
    );
  }

  try {
    const questionId = parseInt(id, 10);
    const [answers] = await pool.query(
      'SELECT id, QuestionId, Name, Body, created_at FROM answers WHERE QuestionId = ? ORDER BY created_at DESC',
      [questionId]
    ) as [Record<string, unknown>[], unknown];
    
    return NextResponse.json({
      success: true,
      data: answers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching answers', {
      questionId: id,
      error: error instanceof Error ? error.message : String(error),
      ip: context.ip
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
}

export const GET = withPublicApi(handleGetAnswers);

async function handleCreateAnswer(request: NextRequest, context: ApiRequestContext, params: { id: string }) {
  const { id } = params;
  
  // Validate ID parameter
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid question ID format' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, body: answerBody } = body;
    
    // Comprehensive input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2-100 characters' },
        { status: 400 }
      );
    }
    
    if (!answerBody || typeof answerBody !== 'string' || answerBody.trim().length < 10 || answerBody.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Answer must be between 10-2000 characters' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs to prevent XSS
    const sanitizedName = sanitizeHtml(name.trim());
    const sanitizedBody = sanitizeHtml(answerBody.trim());
    const questionId = parseInt(id, 10);
    
    // Verify question exists before creating answer
    const [questionCheck] = await pool.query(
      'SELECT id FROM questions WHERE id = ? AND status = "published"',
      [questionId]
    ) as [Record<string, unknown>[], unknown];
    
    if (!Array.isArray(questionCheck) || questionCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found or not published' },
        { status: 404 }
      );
    }
    
    // Insert the answer
    const [result] = await pool.query(
      'INSERT INTO answers (QuestionId, Name, Body, created_at) VALUES (?, ?, ?, NOW())',
      [questionId, sanitizedName, sanitizedBody]
    ) as [DatabaseInsertResult, unknown];
    
    logger.info('Answer created successfully', {
      questionId,
      answerId: result.insertId,
      nameLength: sanitizedName.length,
      bodyLength: sanitizedBody.length,
      ip: context.ip
    });
    
    return NextResponse.json({
      success: true,
      message: 'Answer created successfully',
      data: { id: result.insertId },
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    logger.error('Error creating answer', {
      questionId: id,
      error: error instanceof Error ? error.message : String(error),
      ip: context.ip
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to create answer' },
      { status: 500 }
    );
  }
}

export const POST = withPublicApi(handleCreateAnswer);
