import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { withPublicApi, ApiRequestContext } from '@/lib/api-middleware';
import logger from "@/lib/logger";

async function handleVisitCount(request: NextRequest, context: ApiRequestContext) {
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
    // Log visit attempt for monitoring
    logger.info('Visit count request', {
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: truncatedTimestamp
    });

    await pool.execute(query, [
      truncatedTimestamp,
      day,
      week,
      month,
      year,
    ]);

    return NextResponse.json({
      success: true,
      timestamp: truncatedTimestamp,
      counts: { day, week, month, year }
    });
  } catch (err) {
    logger.error("Database error in Visits route", {
      error: err instanceof Error ? err.message : String(err),
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: truncatedTimestamp
    });
    
    return NextResponse.json(
      { success: false, error: "Failed to record visit" },
      { status: 500 }
    );
  }
}

// Rate limited to prevent abuse - max 10 requests per minute per IP
export const POST = withPublicApi(handleVisitCount);
