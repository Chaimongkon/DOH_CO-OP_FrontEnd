import { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import logger from "@/lib/logger";
import { RateLimiter, sanitizeHtml } from "@/lib/validation";
import { 
  createSuccessResponse 
} from "@/lib/api-helpers";
import { 
  withPublicApi, 
  ApiRequestContext 
} from "@/lib/api-middleware";
import { 
  DatabaseError, 
  ApiError,
  ValidationError,
  RateLimitError 
} from "@/lib/api-errors";

// Rate limiting for complaint submissions - 3 complaints per 10 minutes per IP
const complaintSubmissionLimit = new RateLimiter(3, 10 * 60 * 1000);

// Input validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[0-9-+()\s]{8,15}$/;
  return phoneRegex.test(phone);
}

function validateMemberId(memberId: string): boolean {
  return /^\d{6,10}$/.test(memberId); // 6-10 digits
}

function validateName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\u0e01-\u0e59\s]+$/.test(name);
}

function validateComplaint(complaint: string): boolean {
  return complaint.length >= 10 && complaint.length <= 2000;
}

async function complaintHandler(request: NextRequest, context: ApiRequestContext) {
  try {
    // Rate limiting check for complaint submission
    if (!complaintSubmissionLimit.isAllowed(context.ip)) {
      throw new RateLimitError(
        "Too many complaint submissions. Please wait 10 minutes before submitting again.",
        { ip: context.ip, limit: 3, window: 600000 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON in request body", "body");
    }
    
    // Validate request body structure
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new ValidationError("Request body must be a valid JSON object", "body");
    }
    
    const { memberid, name, tel, email, complaint } = body;

    // Check for excessive properties (potential attack)
    const allowedProperties = ['memberid', 'name', 'tel', 'email', 'complaint'];
    const bodyKeys = Object.keys(body);
    const hasExcessiveProps = bodyKeys.length > allowedProperties.length || 
                             bodyKeys.some(key => !allowedProperties.includes(key));
    
    if (hasExcessiveProps) {
      logger.warn(`Suspicious request with excessive properties from IP: ${context.ip}`, { 
        properties: bodyKeys,
        requestId: context.requestId 
      });
      throw new ValidationError("Request contains invalid or excessive properties", "properties");
    }

    // Required field validation
    if (!complaint || typeof complaint !== 'string') {
      throw new ValidationError("Complaint content is required", "complaint");
    }

    // Validate complaint content
    if (!validateComplaint(complaint)) {
      throw new ValidationError(
        "Complaint must be 10-2000 characters long",
        "complaint"
      );
    }

    // Optional field validations (if provided)
    if (memberid && typeof memberid === 'string' && !validateMemberId(memberid)) {
      throw new ValidationError(
        "Member ID must be 6-10 digits",
        "memberid"
      );
    }

    if (name && typeof name === 'string' && !validateName(name)) {
      throw new ValidationError(
        "Name must be 2-100 characters and contain only letters and spaces",
        "name"
      );
    }

    if (tel && typeof tel === 'string' && !validatePhone(tel)) {
      throw new ValidationError(
        "Phone number must be 8-15 characters and contain only numbers, spaces, and common phone characters",
        "tel"
      );
    }

    if (email && typeof email === 'string' && !validateEmail(email)) {
      throw new ValidationError(
        "Please provide a valid email address",
        "email"
      );
    }

    // Sanitize inputs to prevent XSS
    const sanitizedMemberId = memberid ? sanitizeHtml(memberid.toString().trim()) : null;
    const sanitizedName = name ? sanitizeHtml(name.trim()) : null;
    const sanitizedTel = tel ? sanitizeHtml(tel.trim()) : null;
    const sanitizedEmail = email ? sanitizeHtml(email.trim()) : null;
    const sanitizedComplaint = sanitizeHtml(complaint.trim());

    // Database connection
    let db;
    try {
      db = await pool.getConnection();
      
      if (!db) {
        throw new DatabaseError("Failed to establish database connection");
      }

      // Insert the data into MySQL with prepared statement
      const [result] = await db.execute(
        `INSERT INTO complaints (MemberId, Name, Tel, Email, Complaint, CreateDate) VALUES (?, ?, ?, ?, ?, NOW())`,
        [sanitizedMemberId, sanitizedName, sanitizedTel, sanitizedEmail, sanitizedComplaint]
      );

      logger.info(`Complaint submitted successfully`, {
        requestId: context.requestId,
        ip: context.ip,
        complaintId: (result as { insertId: number }).insertId
      });

      return createSuccessResponse(
        {
          id: (result as { insertId: number }).insertId,
          status: 'submitted'
        },
        "Complaint submitted successfully. We will review your complaint and respond accordingly.",
        { 'X-Complaint-ID': (result as { insertId: number }).insertId.toString() }
      );

    } catch (error) {
      // Convert database errors to ApiError
      if (error instanceof Error && (error.message.includes('ER_') || error.message.includes('MySQL'))) {
        throw new DatabaseError("Failed to save complaint", error, {
          requestId: context.requestId
        });
      }
      
      // Re-throw as-is if it's already an ApiError
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert unknown errors
      throw new ApiError(
        "Unexpected error in complaint submission",
        undefined,
        500,
        undefined,
        true,
        { requestId: context.requestId }
      );
    } finally {
      if (db) {
        try {
          db.release();
        } catch (releaseError) {
          logger.error("Error releasing database connection", releaseError);
        }
      }
    }
  } catch (error) {
    // Let middleware handle the error
    throw error;
  }
}

// Export the wrapped handler
export const POST = withPublicApi(complaintHandler);
