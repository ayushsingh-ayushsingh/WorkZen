import { db } from "../db";
import { resume } from "@/db/schema/resume";
import { eq } from "drizzle-orm";

export async function saveUsersResume(
  userId: string,
  about: string,
  skills: string,
  certifications: string
) {
  try {
    const existing = await db.query.resume.findFirst({
      where: (fields, { eq }) => eq(fields.userId, userId),
    });

    if (existing) {
      const updated = await db
        .update(resume)
        .set({
          about,
          skills,
          certifications,
        })
        .where(eq(resume.userId, userId))
        .returning();

      return {
        success: true,
        data: updated[0],
        message: "Resume updated successfully",
      };
    } else {
      // Insert new resume
      const inserted = await db
        .insert(resume)
        .values({
          userId,
          about,
          skills,
          certifications,
        })
        .returning();

      return {
        success: true,
        data: inserted[0],
        message: "Resume created successfully",
      };
    }
  } catch (error: any) {
    console.error("Error saving resume:", error);
    return { success: false, error: error.message || "Failed to save resume" };
  }
}
