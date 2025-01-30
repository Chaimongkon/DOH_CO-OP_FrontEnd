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
  Detail: string;
  ImageNumber: number;
  ImagePath: string | null;
  ApplicationMainType: string;
  ApplicationType: string;
  CreateDate: string;
}

export async function GET(req: NextRequest) {
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
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
