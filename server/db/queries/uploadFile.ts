import { db } from "../db";
import { files } from "../schema/files";
import { Buffer } from "buffer";

const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

export async function handleFileUpload(
  filename: string,
  data: string,
  mimetype: string
) {
  try {
    const base64Match = data.match(/^data:.*;base64,(.*)$/);
    const base64Data = base64Match ? base64Match[1] : data;
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > MAX_BYTES) {
      throw new Error("File too large (max 30MB)");
    }

    const [inserted] = await db
      .insert(files)
      .values({
        filename,
        mimetype,
        data: buffer,
      })
      .returning();

    return {
      success: true,
      file: inserted,
    };
  } catch (err: any) {
    console.error("File upload error:", err);
    return {
      success: false,
      error: err.message || "Failed to upload file",
    };
  }
}
