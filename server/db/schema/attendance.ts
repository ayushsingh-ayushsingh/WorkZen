import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../schema";

export const employeeAttendance = pgTable("employee_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userName: text("name"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  time: timestamp("time").defaultNow().notNull(),
  isApproved: boolean().default(false).notNull(),
  status: text("status").default("checked_in").notNull(),
  remarks: text("remarks"),
});
