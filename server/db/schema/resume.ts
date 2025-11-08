import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../schema";

export const resume = pgTable("resume", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skills: text(),
  about: text(),
  certifications: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
