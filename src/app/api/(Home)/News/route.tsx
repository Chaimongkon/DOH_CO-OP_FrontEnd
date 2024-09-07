import { NextResponse } from "next/server";
import pool from "../../db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";

// Define the types for the query results
interface NewsRow extends RowDataPacket {
  Id: number;
  Title: string;
  Details: string;
  Image: string;
  PdfFile: string;
  CreateDate: string;
}

export async function GET() {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Id, Title, Details,Image, File, CreateDate FROM news ORDER BY Id DESC";
    const [rows]: [NewsRow[], FieldPacket[]] = await db.execute(query);

    // Process the rows to convert the Image field to base64 string
    const processedRows = rows.map((row) => ({
      ...row,
      Image: row.Image ? Buffer.from(row.Image).toString('base64') : null,
      File: row.File ? Buffer.from(row.File).toString('base64') : null,
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}
