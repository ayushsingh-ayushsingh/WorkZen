import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../schema";
import { organization } from "../schema";

export const employeeCheckIn = pgTable("employee_check_in", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  checkInTime: timestamp("check_in_time").defaultNow().notNull(),
  checkOutTime: timestamp("check_out_time"),
  status: text("status").default("checked_in").notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
