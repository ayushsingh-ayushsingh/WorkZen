import { pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";
import { user } from "../schema";

export const privateBankInfo = pgTable("private_bank_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Private info
  dob: date("dob"),
  address: text("address"),
  nationality: text("nationality"),
  email: text("email"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  joiningDate: date("joining_date"),

  // Bank info
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  ifsc: text("ifsc"),
  pan: text("pan"),
  uan: text("uan"),
  empCode: text("emp_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
