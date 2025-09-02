import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket } from "mysql2"; // Import RowDataPacket

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Increase view count for the question
    await pool.query(
      "UPDATE questions SET ViewCount = ViewCount + 1 WHERE Id = ?",
      [id]
    );

    // Fetch the question details and answers
    const [questionRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM questions WHERE Id = ?",
      [id]
    );
    const [answerRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM answers WHERE QuestionId = ?",
      [id]
    );

    if (questionRows.length === 0) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    const question = questionRows[0];
    const answers = answerRows;

    return NextResponse.json({ question, answers });
  } catch {
    return NextResponse.json(
      { message: "Error fetching question" },
      { status: 500 }
    );
  }
}
