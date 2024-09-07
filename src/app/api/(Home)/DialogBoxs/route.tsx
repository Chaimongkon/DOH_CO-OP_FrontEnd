import { NextResponse, NextRequest } from "next/server";
import pool from "../../db/mysql";

export async function GET(req: NextRequest) {
  const db = await pool.getConnection();
  try {
    const query = "SELECT Id, Image, URLLink, IsActive FROM notification ORDER BY Id ASC";
    const [rows]: [any[], any] = await db.execute(query);

    // Process the rows to convert the Image field to base64 string
    const processedRows = rows.map((row) => ({
      ...row,
      Image: row.Image ? Buffer.from(row.Image).toString('base64') : null,
    }));

    return NextResponse.json(processedRows, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    db.release();
  }
}
