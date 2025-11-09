import { db } from "../db";
import { member } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { payroll } from "../schema/payroll";

export async function allUniqueEmployeesOfOrg(orgId: string) {
  const data = await db
    .select({ userId: member.userId })
    .from(member)
    .where(eq(member.organizationId, orgId))
    .groupBy(member.userId);

  return data;
}

export async function updatePayroll(
  userId: string,
  name: string,
  role: string,
  email: string,
  joinedAt: string,
  ctc: string
) {
  const result = await db
    .insert(payroll)
    .values({
      userId,
      name,
      role,
      email,
      joinedAt,
      ctc: parseInt(ctc, 10),
    })
    .returning();

  return result[0];
}

export async function getUserPayroll(userId: string) {
  try {
    const result = await db
      .select()
      .from(payroll)
      .where(eq(payroll.userId, userId))
      .orderBy(desc(payroll.createdAt))
      .limit(1);

    if (result.length === 0) {
      return {
        success: false,
        message: "No payroll record found for this user.",
      };
    }

    return {
      success: true,
      data: result[0],
    };
  } catch (error: any) {
    console.error("Error fetching latest payroll:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch payroll record.",
    };
  }
}
