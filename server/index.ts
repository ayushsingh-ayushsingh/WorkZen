import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { logger } from "hono/logger";
import { createOrder } from "@/db/queries/payments";
import { handleFileUpload } from "@/db/queries/uploadFile";
import { updateUserProfile } from "@/db/queries/userProfile";
import {
  checkInEmployee,
  checkOutEmployee,
  getEmployeeCheckIns,
} from "./db/queries/checkIn";
import { organization } from "auth-schema";
import { db } from "./db/db";
import { eq } from "drizzle-orm";

const app = new Hono();
app.use(logger());

app.get("/", (c) => {
  return c.text("Hello, Hono!");
});

const router = app
  .basePath("/api")
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/", (c) => {
    return c.text("Hello Hono! -> /api");
  })
  .post("/create-order", async (c) => {
    try {
      const { userId, amount, currency, receipt, notes } = await c.req.json();

      const order = await createOrder(userId, amount, currency, receipt, notes);

      return c.json(order);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Error creating order" }, 500);
    }
  })
  .post("/upload", async (c) => {
    try {
      const { filename, mimetype, data } = await c.req.json();

      if (!filename || !mimetype || !data) {
        return c.json({ success: false, error: "Missing file data" }, 400);
      }

      const result = await handleFileUpload(filename, data, mimetype);

      if (!result.success) {
        return c.json(result, 400);
      }

      return c.json(result, 200);
    } catch (err: any) {
      console.error("upload error:", err);
      return c.json({ success: false, error: "Server error" }, 500);
    }
  })
  .post("/profile", async (c) => {
    try {
      const { userId, name, image } = await c.req.json();

      if (!userId) {
        return c.json({ error: "Missing userId" }, 400);
      }

      let imageUrl: string | undefined;

      if (image) {
        const isBase64 = /^data:image\/(png|jpeg|webp|jpg);base64,/.test(image);
        if (!isBase64) {
          return c.json(
            { error: "Invalid image format. Must be base64-encoded image." },
            400
          );
        }
        imageUrl = image;
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
  })
  .post("/check-in", async (c) => {
    try {
      const { userId, organizationId, remarks } = await c.req.json();

      if (!userId) {
        return c.json({ success: false, message: "Missing userId" }, 400);
      }

      const result = await checkInEmployee(userId, organizationId, remarks);

      return c.json({
        success: true,
        checkInTime: result.checkInTime,
        message: "Checked in successfully",
      });
    } catch (error: any) {
      console.error("Check-in error:", error);
      return c.json(
        { success: false, message: error.message || "Server error" },
        500
      );
    }
  })
  .post("/check-out", async (c) => {
    try {
      const { userId } = await c.req.json();
      const data = await checkOutEmployee(userId);
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .post("/organization", async (c) => {
    try {
      const { orgId } = await c.req.json();

      const data = await db
        .select()
        .from(organization)
        .where(eq(organization.id, orgId))
        .limit(1);

      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .get("/check-ins/:userId", async (c) => {
    try {
      const userId = c.req.param("userId");
      const data = await getEmployeeCheckIns(userId);
      return c.json({ success: true, data });
    } catch (err: any) {
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .post("/form", async (c) => {
    try {
      const { number, email, text, textarea, option } = await c.req.json();
      console.log(number, email, text, textarea, option);
      return c.json({
        success: true,
        number,
        email,
        text,
        textarea,
        option,
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      return c.json({ error: err?.message || "Server error" }, 500);
    }
  });

export default app;
export type AppType = typeof router;
