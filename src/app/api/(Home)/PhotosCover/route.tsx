import { NextResponse } from 'next/server';
import pool from '../../db/mysql'; // Adjust the import path based on your project structure

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT Id, Title, Cover FROM photoalbum');
    connection.release();

    return NextResponse.json({ photos: rows }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching photos' }, { status: 500 });
  }
}
