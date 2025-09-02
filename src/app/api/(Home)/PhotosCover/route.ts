import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface NewsRow extends RowDataPacket {
  Id: number;
  Title: string;
  Cover: string;
}

export async function GET() {
  let db;

  try {
    db = await pool.getConnection();

    const query = `SELECT Id, Title, Cover FROM photoalbum ORDER BY Id DESC `;

    const [rows]: [NewsRow[], FieldPacket[]] = await db.query(query);

    // Check for null or undefined values in Cover and handle them
    const processedRows = rows.map((row: NewsRow) => ({
      ...row,
      Cover: row.Cover
        ? `/api/files/PhotoAlbum/File/${row.Cover.replace(/^\/Uploads\/PhotoAlbum\//, '').replace(/\\/g, '/')}`
        : null,
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    logger.error("Error fetching PhotosCover data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
