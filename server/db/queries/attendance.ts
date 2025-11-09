import { db } from "@/db/db";
import { employeeAttendance } from "../schema";
import { desc, eq, asc, is } from "drizzle-orm";
import { and } from "drizzle-orm";

export async function updateAttendance(
  userId: string,
  name: string,
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
        userName: name,
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
        userName: name,
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
        userName: name,
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

  const latestRecordRows = await db
    .select()
    .from(employeeAttendance)
    .where(eq(employeeAttendance.userId, userId))
    .orderBy(desc(employeeAttendance.time))
    .limit(1);

  const latest = latestRecordRows[0];

  if (!latest) {
    return {
      status: "ABSENT" as const,
      lastActionTime: null,
      remarks: null,
    };
  }

  if (latest.type === "CHECKIN") {
    return {
      status: "PRESENT" as const,
      lastActionTime: latest.time,
      remarks: null,
    };
  }

  if (latest.type === "LEAVE") {
    return {
      status: "LEAVE" as const,
      lastActionTime: latest.time,
      remarks: latest.remarks ?? null,
    };
  }

  return {
    status: "ABSENT" as const,
    lastActionTime: latest.time,
    remarks: null,
  };
}

export async function getAllAttendanceLogs() {
  const res = await db
    .select()
    .from(employeeAttendance)
    .orderBy(asc(employeeAttendance.userName), desc(employeeAttendance.time));

  return res;
}

export async function getAllLeaveLogs() {
  const res = await db
    .select()
    .from(employeeAttendance)
    .where(
      and(
        eq(employeeAttendance.type, "LEAVE"),
        eq(employeeAttendance.isApproved, false)
      )
    )
    .orderBy(asc(employeeAttendance.userName), desc(employeeAttendance.time));

  return res;
}

export async function approveLeave(id: string) {
  try {
    const result = await db
      .update(employeeAttendance)
      .set({ isApproved: true })
      .where(eq(employeeAttendance.id, id))
      .returning();

    return result;
  } catch (error) {
    console.error("Error approving leave:", error);
    throw new Error("Failed to approve leave");
  }
}

export async function rejectLeave(id: string) {
  try {
    const result = await db
      .update(employeeAttendance)
      .set({ isApproved: false })
      .where(eq(employeeAttendance.id, id))
      .returning();

    return result;
  } catch (error) {
    console.error("Error approving leave:", error);
    throw new Error("Failed to approve leave");
  }
}
