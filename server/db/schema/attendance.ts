import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../schema";

export const employeeAttendance = pgTable("employee_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  time: timestamp("check_in_time").defaultNow().notNull(),
  status: text("status").default("checked_in").notNull(),
  remarks: text("remarks"),
});
