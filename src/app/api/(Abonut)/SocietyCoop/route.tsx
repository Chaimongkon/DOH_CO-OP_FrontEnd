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
  Cover: string;
}

export async function GET(req: NextRequest) {
  let db;

  try {
    db = await pool.getConnection();

    const query = `SELECT Id, ImagePath, SocietyType, IsActive FROM cooperativesociety `;

    const [rows]: [NewsRow[], FieldPacket[]] = await db.query(query);

    // Check for null or undefined values in ImagePath and PdfPath and handle them
    const processedRows = rows.map((row: NewsRow) => ({
      ...row,
      ImagePath: row.ImagePath
        ?`/SocietyCoop/File/${path.basename(row.ImagePath)}`
        : null,
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
