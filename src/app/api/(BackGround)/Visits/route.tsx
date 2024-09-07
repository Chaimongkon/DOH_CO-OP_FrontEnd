import { NextResponse, NextRequest } from "next/server";
import pool from "../../db/mysql"; // Ensure this path is correct based on your project structure

export async function POST(request: NextRequest) {
  const truncateMilliseconds = (timestamp: string): string => {
    return timestamp.replace(/\.\d+Z$/, "Z");
  };

  function getISOWeek(date: string | Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localTime = new Date(now.getTime() - offset);
  const timestamp = localTime.toISOString().slice(0, -1); // Remove the 'Z' at the end

  const truncatedTimestamp = truncateMilliseconds(timestamp);

  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const week = getISOWeek(now);

  const query = `
    INSERT INTO countwebvisits (DateTimeStamp, DayCount, WeekCount, MonthCount, YearCount)
    VALUES (?, 1, 1, 1, 1)
    ON DUPLICATE KEY UPDATE
    DayCount = IF(DAY(DateTimeStamp) = ?, DayCount + 1, 1),
    WeekCount = IF(WEEK(DateTimeStamp) = ?, WeekCount + 1, 1),
    MonthCount = IF(MONTH(DateTimeStamp) = ?, MonthCount + 1, 1),
    YearCount = IF(YEAR(DateTimeStamp) = ?, YearCount + 1, 1)
  `;

  try {
    const [result] = await pool.execute(query, [
      truncatedTimestamp,
      day,
      week,
      month,
      year,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
