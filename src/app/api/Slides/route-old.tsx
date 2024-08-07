import { NextRequest, NextResponse } from "next/server";
import pool from "../db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";

// Define the types for the query results
interface SlideRow extends RowDataPacket {
  Id: number;
  No: number;
  Image: Buffer;
  URLLink: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slideId = searchParams.get('slideId');

  if (slideId) {
    // Fetch individual slide image
    return fetchSlideImage(Number(slideId));
  } else {
    // Fetch all slides without images
    return fetchSlidesWithoutImages();
  }
}

async function fetchSlidesWithoutImages() {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Id, No, Image, URLLink FROM slides ORDER BY No ASC";
    const [rows]: [SlideRow[], FieldPacket[]] = await db.execute(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching slides without images:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}

async function fetchSlideImage(slideId: number) {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Image FROM slides WHERE Id = ?";
    const [rows]: [SlideRow[], FieldPacket[]] = await db.execute(query, [slideId]);

    if (rows.length === 0) {
      console.error(`Slide with Id ${slideId} not found`);
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    const row = rows[0];
    const base64Image = row.Image ? Buffer.from(row.Image).toString('base64') : null;
    return NextResponse.json({ Image: base64Image }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching image for slide ${slideId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}
