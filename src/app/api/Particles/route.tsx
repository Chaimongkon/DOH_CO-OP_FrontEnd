//api/PhotoAll/[id]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import pool from "../db/mysql";
import { RowDataPacket } from "mysql2";

export const dynamic = 'force-dynamic';

interface NewsRow extends RowDataPacket {
  Id: number;
  Category: string;
  ImagePath: string;
  IsActive: string;
}

export async function GET(req: NextRequest) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query<NewsRow[]>(
      "SELECT Id, Category, ImagePath, IsActive FROM particles ORDER BY IsActive DESC"
    );
    connection.release();

    if (rows.length > 0) {
      const category = rows[0].Category;
      const isActive = rows[0].IsActive;
      try {
        const images = JSON.parse(rows[0].ImagePath);

        // Process each image to replace '/Uploads/PhotoAlbum/' with '/PhotoAll/File/'
        const processedImages = images.map((image: string) =>
          image.replace('/Uploads/Particles/', '/Particles/File/')
        );

        return NextResponse.json({ images: processedImages, category, isActive }, { status: 200 });
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
