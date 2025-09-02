import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface FormDownloadRow extends RowDataPacket {
  Id: number;
  Title: string;
  TypeForm: string;
  TypeMember: string;
  FilePath: string | null;
  CreateDate: string;
}

export async function GET() {
  let db;
  try {
    db = await pool.getConnection();

    const query = `SELECT Id, Title, TypeForm, TypeMember, FilePath, CreateDate FROM formdowsloads ORDER BY Id ASC`;

    const [rows]: [FormDownloadRow[], FieldPacket[]] = await db.query(query);

    // Check for null or undefined values in FilePath and handle them
    const processedRows = rows.map((row: FormDownloadRow) => ({
      ...row,
      FilePath: row.FilePath
        ? `/DownloadForm/File/${path.basename(row.FilePath)}`
        : null, // Handle null or undefined FilePath
      CreateDate: row.CreateDate || new Date().toISOString(), // Ensure CreateDate is always present
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    logger.error("Error fetching DownloadForm data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
