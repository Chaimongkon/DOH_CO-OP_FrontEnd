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
  Detail: string;
  ImageNumber: number;
  ImagePath: string | null;
  ApplicationMainType: string;
  ApplicationType: string;
  CreateDate: string;
}

export async function GET() {
  let db;

  try {
    db = await pool.getConnection();

    const query = `SELECT Id, Title, Detail, ImageNumber, ImagePath, ApplicationMainType, ApplicationType, CreateDate FROM application`;

    const [rows]: [NewsRow[], FieldPacket[]] = await db.query(query);

    // Process rows, removing /Uploads/Application/ from ImagePath
    const processedRows = rows.map((row: NewsRow) => {
      if (row.ImagePath) {
        const cleanedPath = row.ImagePath.replace("/Uploads/Application/", "");
        const subdirectory = path.dirname(cleanedPath).split(path.sep).pop(); // Extract subdirectory name
        return {
          ...row,
          ImagePath: `/Application/File/${subdirectory}/${path.basename(
            cleanedPath
          )}`,
        };
      } else {
        return { ...row, ImagePath: null };
      }
    });

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error) {
    logger.error("Error fetching Application data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
