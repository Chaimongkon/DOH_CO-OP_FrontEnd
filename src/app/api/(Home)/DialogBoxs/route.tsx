
import { NextResponse, NextRequest } from "next/server";
import pool from "../../db/mysql";
import redis from "../../db/redis"; // Assuming Redis connection is set up correctly
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface DialogRow extends RowDataPacket {
  Id: number;
  ImagePath: string;
  URLLink: string;
  Status: boolean;
}

export async function GET(req: NextRequest) {
  let db;

  try {
    db = await pool.getConnection();

    const query = `SELECT Id, ImagePath, URLLink, IsActive FROM notification ORDER BY Id ASC`;

    const [rows]: [DialogRow[], FieldPacket[]] = await db.query(query);

    // Check for null or undefined values in ImagePath and PdfPath and handle them
    const processedRows = rows.map((row: DialogRow) => ({
      ...row,
      ImagePath: row.ImagePath
        ?`/DialogBoxs/File/${path.basename(row.ImagePath)}`
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
