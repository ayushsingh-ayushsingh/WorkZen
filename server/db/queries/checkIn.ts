import { db } from "@/db/db";
import { employeeCheckIn } from "../schema/checkIn";
import { eq, and, gte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function checkInEmployee(
  userId: string,
  organizationId?: string,
  remarks?: string
) {
  const existing = await db
    .select()
    .from(employeeCheckIn)
    .where(
      and(
        eq(employeeCheckIn.userId, userId),
        eq(employeeCheckIn.status, "checked_in")
      )
    );

  if (existing.length > 0) {
    throw new Error("Employee is already checked in");
  }

  const now = new Date();

  const newCheckIn = await db
    .insert(employeeCheckIn)
    .values({
      id: uuidv4(),
      userId,
      organizationId,
      remarks,
      status: "checked_in",
      checkInTime: now, // ✅ Ensure this column is set explicitly
      updatedAt: now,   // optional but good practice
    })
    .returning();

  return newCheckIn[0];
}

export async function checkOutEmployee(userId: string) {
  const activeSession = await db
    .select()
    .from(employeeCheckIn)
    .where(
      and(
        eq(employeeCheckIn.userId, userId),
        eq(employeeCheckIn.status, "checked_in")
      )
    );

  if (activeSession.length === 0) {
    throw new Error("Employee is not currently checked in");
  }

  const updated = await db
    .update(employeeCheckIn)
    .set({
      checkOutTime: new Date(),
      status: "checked_out",
      updatedAt: new Date(),
    })
    .where(eq(employeeCheckIn.id, activeSession[0].id))
    .returning();

  return updated[0];
}

export async function getEmployeeCheckIns(userId: string) {
  return await db
    .select()
    .from(employeeCheckIn)
    .where(eq(employeeCheckIn.userId, userId))
    .orderBy(employeeCheckIn.checkInTime);
}

export async function getActiveCheckIns() {
  return await db
    .select()
    .from(employeeCheckIn)
    .where(eq(employeeCheckIn.status, "checked_in"));
}

export async function getTodayCheckIns() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await db
    .select()
    .from(employeeCheckIn)
    .where(
      and(
        eq(employeeCheckIn.status, "checked_in"),
        gte(employeeCheckIn.checkInTime, today)
      )
    );
}
