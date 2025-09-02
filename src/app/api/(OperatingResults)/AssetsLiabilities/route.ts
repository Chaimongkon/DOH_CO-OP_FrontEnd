import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";
// Define the types for the query results
interface AssetsRow extends RowDataPacket {
  Id: number;
  Year: string;
  TitleMonth: string;
  PdfFile: Buffer | null;
}

export async function GET(req: NextRequest) {
  let db;
  try {
    db = await pool.getConnection();
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    
    let query: string;
    let params: (string | number)[] = [];
    
    if (year) {
      query = "SELECT Id, Year, TitleMonth, PdfFile FROM assetsliabilities WHERE Year = ? ORDER BY Year DESC";
      params = [year];
    } else {
      query = "SELECT Id, Year, TitleMonth, PdfFile FROM assetsliabilities ORDER BY Year DESC";
    }
    
    const [rows]: [AssetsRow[], FieldPacket[]] = await db.execute(query, params);

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
    logger.error("Error fetching AssetsLiabilities data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
