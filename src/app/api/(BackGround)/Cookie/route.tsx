import { NextResponse, NextRequest } from "next/server";
import pool from "../../db/mysql"; // Adjust the import path as per your project structure

export async function POST(request: NextRequest) {
  // Declare variables outside the try block so they are accessible in the catch block
  let userId: string | undefined;
  let consentStatus: boolean | undefined;
  let cookieCategories: string | undefined;
  let ipAddress: string | undefined;
  let consentDate: string | undefined;
  let userAgent: string | undefined;

  try {
    // Parse the JSON body
    const body = await request.json();
    
    // Assign values to the variables
    userId = body.userId || "anonymous"; // Default to "anonymous" if userId is missing
    consentStatus = body.consentStatus;
    cookieCategories = body.cookieCategories;
    ipAddress = body.ipAddress;
    consentDate = body.consentDate;
    userAgent = body.userAgent;

    // Basic input validation
    if (!userId || !consentStatus || !cookieCategories || !ipAddress || !consentDate || !userAgent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert the consent data into the database
    const query = `
      INSERT INTO cookieconsents (UserId, ConsentStatus, ConsentDate, CookieCategories, IpAddress, UserAgent)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, consentStatus, consentDate, cookieCategories, ipAddress, userAgent];
    await pool.query(query, values);

    // Return a successful response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Error logging with all the relevant details
    console.error("Error processing POST request:", error, {
      userId: userId,
      consentStatus: consentStatus,
      consentDate: consentDate,
      cookieCategories: cookieCategories,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Handle specific error types if needed
    if (error instanceof Error && error.message.includes('MySQL')) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
