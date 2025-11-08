import {
  text,
  pgTable,
  timestamp,
  uuid,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";

import { user } from "../schema";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: text("order_id").notNull(),
  paymentId: text("payment_id"),
  signature: text("razorpay_signature"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // stored in INR (not paise)
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  status: varchar("status", { length: 50 }).default("created").notNull(), // 'created' | 'paid' | 'failed' | etc.
  receipt: text("receipt"),
  paymentMethod: varchar("payment_method", { length: 50 }), // e.g., card, upi, wallet
  notes: text("notes"), // optional JSON/stringified notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
