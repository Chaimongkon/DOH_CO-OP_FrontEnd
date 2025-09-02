import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";
import path from "path";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface NewsRow extends RowDataPacket {
  Id: number;
  Title: string;
  ImagePath: string;
  FilePath: string;
  CreateDate: string;
}

export async function GET() {
  let db;
  try {
    db = await pool.getConnection();

    const query = `SELECT Id, Title, ImagePath, FilePath, CreateDate 
                   FROM businessreport 
                   ORDER BY Id DESC `;

    const [rows]: [NewsRow[], FieldPacket[]] = await db.query(query);

    // Check for null or undefined values in ImagePath and PdfPath and handle them
    const processedRows = rows.map((row: NewsRow) => ({
      ...row,
      ImagePath: row.ImagePath
        ? `/BusinessReport/File/Image/${path.basename(row.ImagePath)}`
        : null, // Handle null or undefined ImagePath
        FilePath: row.FilePath
        ? `/BusinessReport/File/Pdf/${path.basename(row.FilePath)}`
        : null, // Handle null or undefined PdfPath
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    logger.error("Error fetching BusinessReport data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
