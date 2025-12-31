import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, float, index, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * AI models available for battles
 */
export const aiModels = mysqlTable("ai_models", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(), // openai, anthropic, google, etc.
  modelId: varchar("modelId", { length: 255 }).notNull(), // gpt-4, claude-3, gemini-pro, etc.
  description: text("description"),
  category: varchar("category", { length: 100 }), // chat, code, reasoning, etc.
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  eloRating: int("eloRating").default(1500).notNull(), // ELO rating system
  totalBattles: int("totalBattles").default(0).notNull(),
  totalWins: int("totalWins").default(0).notNull(),
  totalLosses: int("totalLosses").default(0).notNull(),
  totalDraws: int("totalDraws").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  providerModelIdx: uniqueIndex("provider_model_idx").on(table.provider, table.modelId),
  eloIdx: index("elo_idx").on(table.eloRating),
}));

export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = typeof aiModels.$inferInsert;

/**
 * Battle topics/prompts for AI competitions
 */
export const battleTopics = mysqlTable("battle_topics", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // creative, technical, reasoning, etc.
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  isActive: int("isActive").default(1).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
}));

export type BattleTopic = typeof battleTopics.$inferSelect;
export type InsertBattleTopic = typeof battleTopics.$inferInsert;

/**
 * Battles between AI models
 */
export const battles = mysqlTable("battles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  model1Id: int("model1Id").notNull(),
  model2Id: int("model2Id").notNull(),
  topicId: int("topicId").notNull(),
  customPrompt: text("customPrompt"), // user can override topic prompt
  model1Response: text("model1Response"),
  model2Response: text("model2Response"),
  model1ResponseTime: int("model1ResponseTime"), // milliseconds
  model2ResponseTime: int("model2ResponseTime"), // milliseconds
  winnerId: int("winnerId"), // null = draw, otherwise model id
  status: mysqlEnum("status", ["pending", "completed", "error"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  model1Idx: index("model1_idx").on(table.model1Id),
  model2Idx: index("model2_idx").on(table.model2Id),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = typeof battles.$inferInsert;

/**
 * User votes on battle results
 */
export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  battleId: int("battleId").notNull(),
  userId: int("userId").notNull(),
  votedModelId: int("votedModelId"), // null = draw vote
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  battleUserIdx: uniqueIndex("battle_user_idx").on(table.battleId, table.userId),
  battleIdx: index("battle_idx").on(table.battleId),
}));

export type Vote = typeof votes.$inferSelect;
export type InsertVote = typeof votes.$inferInsert;

/**
 * Battle statistics and analytics
 */
export const battleStats = mysqlTable("battle_stats", {
  id: int("id").autoincrement().primaryKey(),
  modelId: int("modelId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  battlesCount: int("battlesCount").default(0).notNull(),
  winsCount: int("winsCount").default(0).notNull(),
  lossesCount: int("lossesCount").default(0).notNull(),
  drawsCount: int("drawsCount").default(0).notNull(),
  avgResponseTime: float("avgResponseTime"), // milliseconds
  totalVotes: int("totalVotes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  modelDateIdx: uniqueIndex("model_date_idx").on(table.modelId, table.date),
  dateIdx: index("date_idx").on(table.date),
}));

export type BattleStat = typeof battleStats.$inferSelect;
export type InsertBattleStat = typeof battleStats.$inferInsert;

/**
 * User preferences and settings
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  favoriteModels: text("favoriteModels"), // JSON array of model IDs
  emailNotifications: int("emailNotifications").default(1).notNull(),
  battleReminders: int("battleReminders").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
