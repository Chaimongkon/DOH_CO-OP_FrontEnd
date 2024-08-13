import { NextResponse, NextRequest } from "next/server";
import pool from "../db/mysql"; // Ensure this path is correct based on your project structure

export async function POST(request: NextRequest) {
  // Log the incoming request method and URL
  console.log("Incoming request:", request.method, request.url);

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

  // Log the original timestamp
  console.log("Original timestamp:", timestamp);

  const truncatedTimestamp = truncateMilliseconds(timestamp);

  // Log the truncated timestamp
  console.log("Truncated timestamp:", truncatedTimestamp);

  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const week = getISOWeek(now);

  // Log the date components
  console.log("Date components - Day:", day, "Month:", month, "Year:", year, "Week:", week);

  const query = `
    INSERT INTO countwebvisits (DateTimeStamp, DayCount, WeekCount, MonthCount, YearCount)
    VALUES (?, 1, 1, 1, 1)
    ON DUPLICATE KEY UPDATE
    DayCount = IF(DAY(DateTimeStamp) = ?, DayCount + 1, 1),
    WeekCount = IF(WEEK(DateTimeStamp) = ?, WeekCount + 1, 1),
    MonthCount = IF(MONTH(DateTimeStamp) = ?, MonthCount + 1, 1),
    YearCount = IF(YEAR(DateTimeStamp) = ?, YearCount + 1, 1)
  `;

  // Log the query and the parameters
  console.log("Executing query:", query);
  console.log("Query parameters:", [
    truncatedTimestamp,
    day,
    week,
    month,
    year,
  ]);

  try {
    const [result] = await pool.execute(query, [
      truncatedTimestamp,
      day,
      week,
      month,
      year,
    ]);

    // Log the query result
    console.log("Query result:", result);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
