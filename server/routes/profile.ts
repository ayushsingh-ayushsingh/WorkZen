import { Hono } from "hono";
import { updateUserProfile } from "@/db/queries/userProfile";
import { Buffer } from "buffer";

export const profile = new Hono().post("/update", async (c) => {
  try {
    const formData = await c.req.formData();

    const userId = formData.get("userId")?.toString();
    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    const name = formData.get("name")?.toString().trim() || undefined;
    const file = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (file && file.size > 0) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        return c.json(
          { error: "Invalid file type. Only JPG, PNG, and WEBP are allowed." },
          400
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const updated = await updateUserProfile(userId, {
      name,
      image: imageUrl,
    });

    if (!updated) {
      return c.json({ error: "User not found or update failed" }, 404);
    }

    return c.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return c.json({ error: err?.message || "Server error" }, 500);
  }
});
