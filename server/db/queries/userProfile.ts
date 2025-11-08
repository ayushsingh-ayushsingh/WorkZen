import { db } from "@/db/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserProfile(
  userId: string,
  data: { name?: string; image?: string }
) {
  const updateData: Partial<typeof user.$inferInsert> = {};

  if (data.name) updateData.name = data.name;
  if (data.image) updateData.image = data.image;

  const [updated] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning();

  return updated;
}
