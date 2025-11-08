import { db } from "@/db/db";
import { employeeAttendance } from "../schema";
import { desc, eq, lt, gte } from "drizzle-orm";
import { and } from "drizzle-orm";

export async function updateAttendance(
  userId: string,
  type: string,
  remarks?: string
) {
  const action = (type || "").toUpperCase();

  if (!userId) {
    throw new Error("Missing userId");
  }

  if (action === "CHECKIN") {
    const last = await db
      .select()
      .from(employeeAttendance)
      .where(eq(employeeAttendance.userId, userId))
      .orderBy(desc(employeeAttendance.time))
      .limit(1);

    const lastRow = last[0];

    if (
      lastRow &&
      lastRow.type === "CHECKIN" &&
      lastRow.status === "checked_in"
    ) {
      return {
        success: false,
        message: "User already checked in",
        time: lastRow.time,
      };
    }

    const insertRes = await db
      .insert(employeeAttendance)
      .values({
        userId,
        type: "CHECKIN",
        status: "checked_in",
      })
      .returning();

    const inserted = insertRes[0];
    return { time: inserted.time };
  }

  if (action === "CHECKOUT") {
    const recentCheckinRows = await db
      .select()
      .from(employeeAttendance)
      .where(
        and(
          eq(employeeAttendance.userId, userId),
          eq(employeeAttendance.type, "CHECKIN"),
          eq(employeeAttendance.status, "checked_in")
        )
      )
      .orderBy(desc(employeeAttendance.time))
      .limit(1);

    const recentCheckin = recentCheckinRows[0];
    if (!recentCheckin) {
      return {
        success: false,
        message: "No active check-in found to check out from",
      };
    }

    const checkoutRows = await db
      .insert(employeeAttendance)
      .values({
        userId,
        type: "CHECKOUT",
        status: "checked_out",
      })
      .returning();

    const checkout = checkoutRows[0];

    return {
      checkInTime: recentCheckin.time,
      time: checkout.time,
    };
  }

  if (action === "LEAVE") {
    const insertRes = await db
      .insert(employeeAttendance)
      .values({
        userId,
        type: "LEAVE",
        status: "leave_applied",
        remarks: remarks ?? null,
      })
      .returning();

    const inserted = insertRes[0];
    return { time: inserted.time };
  }

  throw new Error("Unknown attendance type");
}

export async function checkAttendanceStatus(userId: string) {
  if (!userId) throw new Error("Missing userId");

  // --- IST timezone conversion ---
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istNowMs = utcMs + IST_OFFSET_MS;
  const istNow = new Date(istNowMs);

  const year = istNow.getUTCFullYear();
  const month = istNow.getUTCMonth();
  const date = istNow.getUTCDate();

  const startOfIstDayUtcMs = Date.UTC(year, month, date) - IST_OFFSET_MS;
  const startOfNextIstDayUtcMs =
    Date.UTC(year, month, date + 1) - IST_OFFSET_MS;

  const startOfDay = new Date(startOfIstDayUtcMs);
  const endOfDay = new Date(startOfNextIstDayUtcMs);

  // --- Fetch today's attendance records ---
  const todaysRows = await db
    .select()
    .from(employeeAttendance)
    .where(
      and(
        eq(employeeAttendance.userId, userId),
        gte(employeeAttendance.time, startOfDay),
        lt(employeeAttendance.time, endOfDay)
      )
    )
    .orderBy(desc(employeeAttendance.time));

  // --- No record = ABSENT ---
  if (!todaysRows || todaysRows.length === 0) {
    return {
      status: "ABSENT" as const,
      firstCheckIn: null,
      lastCheckOut: null,
      totalHoursToday: 0,
    };
  }

  // --- Latest record decides the status ---
  const latest = todaysRows[0];

  if (latest.type === "LEAVE") {
    return {
      status: "LEAVE" as const,
      firstCheckIn: null,
      lastCheckOut: null,
      totalHoursToday: 0,
      remarks: latest.remarks ?? null,
      time: latest.time ?? null,
    };
  }

  if (latest.type === "CHECKIN") {
    const firstCheckIn =
      todaysRows.filter((r) => r.type === "CHECKIN").pop()?.time ?? latest.time;

    return {
      status: "PRESENT" as const,
      firstCheckIn,
      lastCheckOut: null,
      totalHoursToday: 0,
      time: latest.time,
    };
  }

  if (latest.type === "CHECKOUT") {
    const firstCheckIn =
      todaysRows.find((r) => r.type === "CHECKIN")?.time ?? null;
    const lastCheckOut = latest.time;

    return {
      status: "ABSENT" as const,
      firstCheckIn,
      lastCheckOut,
      totalHoursToday: 0,
      time: lastCheckOut,
    };
  }

  return {
    status: "ABSENT" as const,
    firstCheckIn: null,
    lastCheckOut: null,
    totalHoursToday: 0,
  };
}
