import { NextResponse, NextRequest } from "next/server";
import pool from "../db/mysql";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = await pool.getConnection();
  try {
    const query = "SELECT Id, Status FROM statushome";
    const [rows]: [any[], any] = await db.execute(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    db.release();
  }
}
