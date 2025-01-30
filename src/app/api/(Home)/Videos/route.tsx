import { NextResponse } from "next/server";
import pool from "../../db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";

export const dynamic = 'force-dynamic';
interface VideoRow extends RowDataPacket {
  Id: number;
  Title: string; 
  YouTubeUrl: string;  
  Details: string;
}

export async function GET() {
  let db;
  try {
    db = await pool.getConnection();
    const query = "SELECT Id, Title, YouTubeUrl, Details FROM videos ORDER BY Id DESC";
    const [rows]: [VideoRow[], FieldPacket[]] = await db.execute(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}
