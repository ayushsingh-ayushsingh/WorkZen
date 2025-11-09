import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const payroll = pgTable("payroll", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  name: text(),
  role: text(),
  email: text(),
  joinedAt: text(),
  ctc: integer(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
