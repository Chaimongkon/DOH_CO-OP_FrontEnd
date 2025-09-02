import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";

interface SlideRow extends RowDataPacket {
  Id: number;
  Name: string;
  Doh: number;
  Coop: number;
  Mobile: string;
}

export async function GET() {
  let db;
  try {
    db = await pool.getConnection();
    const query =
      "SELECT Id, Name, Doh, Coop, Mobile FROM contact ORDER BY Id ASC";
    const [rows]: [SlideRow[], FieldPacket[]] = await db.execute(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    logger.error("Error fetching contact data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (db) db.release();
  }
}
