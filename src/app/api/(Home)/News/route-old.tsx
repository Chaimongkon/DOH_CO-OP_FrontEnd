import { NextRequest, NextResponse } from "next/server";
import pool from "../../db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";

// Define the types for the query results
interface SlideRow extends RowDataPacket {
  Id: number;
  Title: string;
  Details: string;
  CreateDate: string;
  Image?: Buffer;
  File?: Buffer;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newId = searchParams.get('newId');

  if (newId) {
    // Fetch individual slide image
    return fetchSlideImage(Number(newId));
  } else {
    // Fetch all slides without images
    return fetchSlidesWithoutImages();
  }
}

async function fetchSlidesWithoutImages() {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Id, Title, Details, CreateDate FROM news ORDER BY Id ASC";
    const [rows]: [SlideRow[], FieldPacket[]] = await db.execute(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching slides without images:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}

async function fetchSlideImage(newId: number) {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Image, File FROM news WHERE Id = ?";
    const [rows]: [SlideRow[], FieldPacket[]] = await db.execute(query, [newId]);

    if (rows.length === 0) {
      console.error(`Slide with Id ${newId} not found`);
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    const row = rows[0];
    const base64Image = row.Image ? Buffer.from(row.Image).toString('base64') : null;
    const base64Pdf = row.File ? Buffer.from(row.File).toString('base64') : null;
    return NextResponse.json({ Image: base64Image, File: base64Pdf }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching image for slide ${newId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}
