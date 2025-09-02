import { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { format } from 'date-fns';
import logger from "@/lib/logger";
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
  ValidationError 
} from "@/lib/api-errors";

async function cookieConsentHandler(request: NextRequest, context: ApiRequestContext) {
  let db;

  try {
    // Parse the JSON body
    const body = await request.json();
    
    // Extract values from body
    const userId = body.userId || "anonymous";
    const consentStatus = body.consentStatus;
    const cookieCategories = body.cookieCategories;
    const ipAddress = body.ipAddress || context.ip;
    const consentDate = body.consentDate;
    const userAgent = body.userAgent || context.userAgent;

    // Input validation
    if (typeof consentStatus !== 'boolean') {
      throw new ValidationError(
        "Consent status must be a boolean value",
        "consentStatus",
        { received: typeof consentStatus }
      );
    }

    if (!cookieCategories || typeof cookieCategories !== 'string') {
      throw new ValidationError(
        "Cookie categories are required",
        "cookieCategories"
      );
    }

    if (!consentDate) {
      throw new ValidationError(
        "Consent date is required",
        "consentDate"
      );
    }

    // Validate and format consent date
    let formattedConsentDate: string;
    try {
      formattedConsentDate = format(new Date(consentDate), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      throw new ValidationError(
        "Invalid consent date format",
        "consentDate",
        { received: consentDate }
      );
    }

    // Database connection
    db = await pool.getConnection();
    
    if (!db) {
      throw new DatabaseError("Failed to establish database connection");
    }

    // Insert the consent data into the database
    const query = `
      INSERT INTO cookieconsents (UserId, ConsentStatus, ConsentDate, CookieCategories, IpAddress, UserAgent)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, consentStatus, formattedConsentDate, cookieCategories, ipAddress, userAgent];
    
    await db.query(query, values);

    logger.info("Cookie consent recorded successfully", {
      requestId: context.requestId,
      userId,
      consentStatus,
      ip: ipAddress,
      categories: cookieCategories
    });

    // Return a successful response in original format
    return createSuccessResponse(
      { success: true },
      "Cookie consent recorded successfully"
    );

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && (error.message.includes('ER_') || error.message.includes('MySQL'))) {
      throw new DatabaseError("Failed to save cookie consent", error, {
        requestId: context.requestId
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in cookie consent API",
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
}

// Export the wrapped handler
export const POST = withPublicApi(cookieConsentHandler);
