import { NextResponse } from 'next/server';
import pool from '@/app/api/db/mysql';


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const [answers] = await pool.query('SELECT * FROM answers WHERE QuestionId = ?', [id]);
    return NextResponse.json(answers);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching answers' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { body } = await req.json();

  if (!body) {
    return NextResponse.json({ message: 'Answer body is required' }, { status: 400 });
  }

  try {
    await pool.query('INSERT INTO answers (QuestionId, Body) VALUES (?, ?)', [id, body]);
    return NextResponse.json({ message: 'Answer created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating answer' }, { status: 500 });
  }
}
