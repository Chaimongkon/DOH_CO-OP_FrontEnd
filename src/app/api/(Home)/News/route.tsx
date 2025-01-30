import { NextResponse, NextRequest } from "next/server";
import pool from "../../db/mysql";
import redis from "../../db/redis"; // Assuming Redis connection is set up correctly
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface NewsRow extends RowDataPacket {
  Id: number;
  Title: string;
  Details: string;
  ImagePath: string;
  PdfPath: string;
  CreateDate: string;
}

export async function GET(req: NextRequest) {
  let db;
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

  try {
    db = await pool.getConnection();

    const query = `SELECT Id, Title, Details, ImagePath, PdfPath, CreateDate 
                   FROM news 
                   ORDER BY Id DESC 
                   LIMIT ? 
                   OFFSET ?`;

    const [rows]: [NewsRow[], FieldPacket[]] = await db.query(query, [
      limit,
      offset,
    ]);

    // Check for null or undefined values in ImagePath and PdfPath and handle them
    const processedRows = rows.map((row: NewsRow) => ({
      ...row,
      ImagePath: row.ImagePath
        ? `/News/File/Image/${path.basename(row.ImagePath)}`
        : null, // Handle null or undefined ImagePath
      PdfPath: row.PdfPath
        ? `/News/File/Pdf/${path.basename(row.PdfPath)}`
        : null, // Handle null or undefined PdfPath
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
