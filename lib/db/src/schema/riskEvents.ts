import { pgTable, serial, text, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", ["climate", "economic", "supply_chain"]);
export const riskLevelEnum = pgEnum("risk_level", ["Low", "Medium", "High"]);

export const riskEventsTable = pgTable("risk_events", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  category: categoryEnum("category").notNull(),
  riskScore: real("risk_score").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  source: text("source").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isAnomaly: boolean("is_anomaly").default(false).notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});

export const insertRiskEventSchema = createInsertSchema(riskEventsTable).omit({ id: true });
export type InsertRiskEvent = z.infer<typeof insertRiskEventSchema>;
export type RiskEvent = typeof riskEventsTable.$inferSelect;
