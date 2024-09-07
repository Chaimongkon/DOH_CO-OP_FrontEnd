import { NextResponse, NextRequest } from "next/server";
import pool from "../../db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";

// Define the types for the query results
interface NewsRow extends RowDataPacket {
  Year: string;
  TitleMonth: string;
  PdfFile: Buffer | null;
}

export async function GET(req: NextRequest) {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Year, TitleMonth, PdfFile FROM assetsliabilities ORDER BY Year DESC";
    
    const [rows]: [NewsRow[], FieldPacket[]] = await db.execute(query);

    // Process the rows to convert the PdfFile fields to base64 strings
    const processedRows = rows.map((row) => ({
      ...row,
      PdfFile: row.PdfFile ? Buffer.from(row.PdfFile).toString("base64") : null,
    }));

    return NextResponse.json(
      {
        data: processedRows,
      },
      { status: 200 }
    );
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
