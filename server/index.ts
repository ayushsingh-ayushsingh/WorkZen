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
import { db } from "./db/db";
import { eq } from "drizzle-orm";
import { user, member, organization } from "./db/schema";
import {
  checkAttendanceStatus,
  updateAttendance,
} from "./db/queries/attendance";
import { saveUsersResume } from "./db/queries/saveUserResume";
import { savePrivateBankInfo } from "./db/queries/privateBankInfo";

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
  .post("/attendance", async (c) => {
    try {
      const { userId, type, remarks } = await c.req.json();

      if (!userId || !type) {
        return c.json(
          { success: false, message: "Missing userId or type" },
          400
        );
      }

      const result = await updateAttendance(userId, type, remarks);

      let message = "";

      if (type === "CHECKIN") message = "Checked in successfully";
      else if (type === "CHECKOUT") message = "Checked out successfully";
      else if (type === "LEAVE")
        message = "Leave request submitted successfully";
      else message = "Action completed";

      return c.json({
        success: true,
        time: result.time,
        message,
      });
    } catch (error: any) {
      console.error("Attendance error:", error);
      return c.json(
        { success: false, message: error.message || "Server error" },
        500
      );
    }
  })
  .get("/attendance-status/:userId", async (c) => {
    try {
      const { userId } = c.req.param();

      if (!userId) {
        return c.json({ success: false, message: "Missing userId" }, 400);
      }

      const result = await checkAttendanceStatus(userId);

      return c.json({
        success: true,
        time: result.time,
        memberStatus: result.status,
      });
    } catch (error: any) {
      console.error("Attendance error:", error);
      return c.json(
        { success: false, message: error.message || "Server error" },
        500
      );
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
      // Just for testing
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
  })
  .post("/organisation-by-slug", async (c) => {
    const { slug } = await c.req.json();
    const orgSlug = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });
    return c.json({
      success: true,
      data: JSON.parse(JSON.stringify(orgSlug)),
    });
  })
  .post("/organisation-members-by-user-id", async (c) => {
    try {
      const { userId } = await c.req.json();

      if (!userId) {
        return c.json({ success: false, message: "Missing userId" }, 400);
      }

      const orgData = await db.query.member.findFirst({
        where: eq(member.userId, userId),
        with: {
          organization: {
            with: {
              members: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!orgData) {
        return c.json(
          { success: false, message: "Organization not found" },
          404
        );
      }

      return c.json({
        success: true,
        data: orgData.organization,
        // data: JSON.parse(JSON.stringify(orgData.organization)),
      });
    } catch (err: any) {
      console.error("organisation-by-user-id error:", err);
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .post("/add-member", async (c) => {
    try {
      const { userId, role, organizationId } = await c.req.json();
      const data = await auth.api.addMember({
        body: {
          userId,
          role,
          organizationId,
        },
      });
      return c.json(data);
    } catch (err: any) {
      console.error("organisation-by-user-id error:", err);
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .post("/save-resume", async (c) => {
    try {
      const { userId, about, skills, certifications } = await c.req.json();

      if (!userId) {
        return c.json({ success: false, error: "Missing userId" }, 400);
      }

      const result = await saveUsersResume(
        userId,
        about,
        skills,
        certifications
      );

      if (!result.success) {
        return c.json({ success: false, error: result.error }, 500);
      }

      return c.json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (err: any) {
      console.error("save-resume route error:", err);
      return c.json(
        { success: false, error: err.message || "Internal Server Error" },
        500
      );
    }
  })
  .get("/get-resume/:userId", async (c) => {
    try {
      const userId = c.req.param("userId");

      if (!userId) {
        return c.json({ success: false, error: "Missing userId" }, 400);
      }

      const data = await db.query.resume.findFirst({
        where: (fields, { eq }) => eq(fields.userId, userId),
      });

      if (!data) {
        return c.json({
          success: true,
          data: null,
          message: "No resume found",
        });
      }

      return c.json({ success: true, data });
    } catch (err: any) {
      console.error("get-resume route error:", err);
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .get("/get-private-bank-info/:userId", async (c) => {
    try {
      const userId = c.req.param("userId");

      if (!userId) {
        return c.json({ success: false, error: "Missing userId" }, 400);
      }

      const data = await db.query.privateBankInfo.findFirst({
        where: (fields, { eq }) => eq(fields.userId, userId),
      });

      if (!data) {
        return c.json({ success: true, data: null, message: "No info found" });
      }

      return c.json({ success: true, data });
    } catch (err: any) {
      console.error("get-private-bank-info error:", err);
      return c.json({ success: false, error: err.message }, 500);
    }
  })
  .post("/save-private-bank-info", async (c) => {
    try {
      const body = await c.req.json();
      const { userId, ...info } = body;

      if (!userId) {
        return c.json({ success: false, error: "Missing userId" }, 400);
      }

      const result = await savePrivateBankInfo(userId, info);

      if (!result.success) {
        return c.json({ success: false, error: result.error }, 500);
      }

      return c.json(result);
    } catch (err: any) {
      console.error("save-private-bank-info error:", err);
      return c.json({ success: false, error: err.message }, 500);
    }
  });

export default app;
export type AppType = typeof router;
