import { NextResponse } from "next/server";
import pool from "../db/mysql";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberid, name, tel, email, complaint } = body;

    if (!complaint) {
      return NextResponse.json(
        { error: "complaint are required fields" },
        { status: 400 }
      );
    }

    // Insert the data into MySQL
    const [result] = await pool.execute(
      `INSERT INTO complaints (MemberId, Name, Tel, Email, Complaint, CreateDate) VALUES (?, ?, ?, ?, ?, NOW())`,
      [memberid, name, tel, email, complaint]
    );

    return NextResponse.json(
      { message: "successfully"},
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting complaint:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
