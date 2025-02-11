//api/PhotoAll/[id]/route.tsx
import { NextResponse } from "next/server";
import pool from "../../../db/mysql";
import { RowDataPacket } from "mysql2";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT Title, Image FROM photoalbum WHERE Id = ?",
      [params.id]
    );
    connection.release();

    if (rows.length > 0) {
      const title = rows[0].Title;
      try {
        const images = JSON.parse(rows[0].Image);

        // Process each image to replace '/Uploads/PhotoAlbum/' with '/PhotoAll/File/'
        const processedImages = images.map((image: string) =>
          image.replace('/Uploads/PhotoAlbum/', '/PhotoAll/File/')
        );

        return NextResponse.json({ images: processedImages, title }, { status: 200 });
      } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError);
        return NextResponse.json(
          { message: "Invalid image data format" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Images not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { message: "Error fetching images" },
      { status: 500 }
    );
  }
}
