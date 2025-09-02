import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

interface ElectionRow extends RowDataPacket {
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
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      if (searchTerm.length <= 6) {
        // Search by Member number (up to 6 digits, pad with zeros)
        query += " WHERE Member = ?";
        params.push(searchTerm.padStart(6, '0')); // Ensure 6 digits with leading zeros
      } else if (searchTerm.length === 13) {
        // Search by ID Card number (exactly 13 digits)
        query += " WHERE IdCard = ?";
        params.push(searchTerm);
      } else {
        // Invalid search length - return empty result
        query += " WHERE 1 = 0"; // This will return no results
      }
    }

    // Execute the query
    const [rows]: [ElectionRow[], FieldPacket[]] = await db.execute(query, params);

    // Prepare the response data
    const responseData = {
      data: rows,
    };

    // Return the response data
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    // Log the error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error("Error fetching election data:", errorMessage);

    // Return a 500 error with the message
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500 }
    );
  } finally {
    // Ensure the database connection is released
    if (db) db.release();
  }
}