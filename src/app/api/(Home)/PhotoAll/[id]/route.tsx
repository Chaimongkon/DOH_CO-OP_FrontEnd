import { NextResponse } from "next/server";
import pool from "../../../db/mysql";
import { RowDataPacket } from "mysql2";

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
    const title = rows[0].Title;
    if (rows.length > 0) {
      try {
        const images = JSON.parse(rows[0].Image);

        return NextResponse.json({ images, title }, { status: 200 });
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
