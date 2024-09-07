import { NextResponse } from "next/server";
import pool from "../../db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";

// Define the types for the query results
interface FormDownloadRow extends RowDataPacket {
    Id: number;
    Title: string;
    TypeForm: string;
    TypeMember: string;
    File: string;
    CreateDate: string;
}

export async function GET() {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Id, Title,TypeForm, TypeMember, PdfFile FROM formdowsloads ORDER BY TypeForm DESC";
    const [rows]: [FormDownloadRow[], FieldPacket[]] = await db.execute(query);

    // Process the rows to convert the Image field to base64 string
    const processedRows = rows.map((row) => ({
      ...row,
      File: row.PdfFile ? Buffer.from(row.PdfFile).toString('base64') : null,
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}
