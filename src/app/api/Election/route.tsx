import { NextResponse, NextRequest } from "next/server";
import pool from "../db/mysql"; // Assuming you have a pool connection setup
import { RowDataPacket, FieldPacket } from "mysql2";

export const dynamic = "force-dynamic";

interface NewsRow extends RowDataPacket {
  Id: number;
  Member: string;
  IdCard: string;
  FullName: string;
  Department: string;
  FieldNumber: string;
  SequenceNumber: string;
}

export async function GET(req: NextRequest) {
  const db = await pool.getConnection();

  try {
    const search = req.nextUrl.searchParams.get("search");

    const params: (string | number)[] = [];
    let query = `
      SELECT Id, Member, IdCard, FullName, Department, FieldNumber, SequenceNumber
      FROM election
    `;

    // Add search filter if present
    if (search) {
      query += " WHERE Member LIKE ? OR IdCard LIKE ?";
      params.push(`%${search}%`, `%${search}`);
    }

    // Execute the query
    const [rows]: [NewsRow[], FieldPacket[]] = await db.execute(query, params);

    // Prepare the response data
    const responseData = {
      data: rows,
    };

    // Return the response data
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error fetching data:", error.message);

    // Return a 500 error with the message
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  } finally {
    // Ensure the database connection is released
    if (db) db.release();
  }
}
