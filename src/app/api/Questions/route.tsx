import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import pool from "../db/mysql";

export async function GET() {
  try {
    // Fetch questions along with view count and answer count
    const [questions] = await pool.query(`
      SELECT 
      q.Id, 
      q.Title, 
      q.Name, 
      q.ViewCount, 
      COUNT(a.Id) AS AnswerCount
    FROM questions q
    LEFT JOIN answers a ON q.Id = a.QuestionId
    GROUP BY q.id, q.Title, q.name, q.ViewCount
    ORDER BY q.CreatedAt DESC
      `);
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching questions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { name, memberNumber, title, body } = await req.json();

  if (!name || !memberNumber || !title || !body) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO questions (Name, MemberNumber, Title, Body) VALUES (?, ?, ?, ?)",
      [name, memberNumber, title, body]
    );

    // result.insertId จะถูกต้องที่นี่
    return NextResponse.json(
      { id: result.insertId, name, memberNumber, title, body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating question" },
      { status: 500 }
    );
  }
}
