import { eq, desc, and, sql, inArray, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  aiModels, 
  InsertAiModel,
  battleTopics,
  InsertBattleTopic,
  battles,
  InsertBattle,
  votes,
  InsertVote,
  battleStats,
  InsertBattleStat,
  userPreferences,
  InsertUserPreference,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Management ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ AI Models ============

export async function createAiModel(model: InsertAiModel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiModels).values(model);
  return result;
}

export async function getAiModels(filters?: { provider?: string; category?: string; isActive?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(aiModels);
  
  const conditions = [];
  if (filters?.provider) conditions.push(eq(aiModels.provider, filters.provider));
  if (filters?.category) conditions.push(eq(aiModels.category, filters.category));
  if (filters?.isActive !== undefined) conditions.push(eq(aiModels.isActive, filters.isActive));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(aiModels.eloRating));
}

export async function getAiModelById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(aiModels).where(eq(aiModels.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAiModelStats(modelId: number, stats: { 
  totalBattles?: number; 
  totalWins?: number; 
  totalLosses?: number; 
  totalDraws?: number;
  eloRating?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(aiModels).set(stats).where(eq(aiModels.id, modelId));
}

export async function searchAiModels(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(aiModels)
    .where(
      and(
        eq(aiModels.isActive, 1),
        sql`(${aiModels.name} LIKE ${`%${searchTerm}%`} OR ${aiModels.description} LIKE ${`%${searchTerm}%`})`
      )
    )
    .orderBy(desc(aiModels.eloRating));
}

// ============ Battle Topics ============

export async function createBattleTopic(topic: InsertBattleTopic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(battleTopics).values(topic);
  return result;
}

export async function getBattleTopics(filters?: { category?: string; difficulty?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(battleTopics.isActive, 1)];
  
  if (filters?.category) {
    conditions.push(eq(battleTopics.category, filters.category));
  }
  if (filters?.difficulty) {
    conditions.push(eq(battleTopics.difficulty, filters.difficulty as any));
  }
  
  return db.select().from(battleTopics)
    .where(and(...conditions))
    .orderBy(desc(battleTopics.usageCount));
}

export async function getRandomBattleTopic() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(battleTopics)
    .where(eq(battleTopics.isActive, 1))
    .orderBy(sql`RAND()`)
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementTopicUsage(topicId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(battleTopics)
    .set({ usageCount: sql`${battleTopics.usageCount} + 1` })
    .where(eq(battleTopics.id, topicId));
}

// ============ Battles ============

export async function createBattle(battle: InsertBattle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(battles).values(battle);
  return Number(result[0].insertId);
}

export async function getBattleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(battles).where(eq(battles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBattle(id: number, updates: Partial<InsertBattle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(battles).set(updates).where(eq(battles.id, id));
}

export async function getUserBattles(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(battles)
    .where(eq(battles.userId, userId))
    .orderBy(desc(battles.createdAt))
    .limit(limit);
}

export async function getRecentBattles(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(battles)
    .where(eq(battles.status, "completed"))
    .orderBy(desc(battles.createdAt))
    .limit(limit);
}

// ============ Votes ============

export async function createVote(vote: InsertVote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(votes).values(vote);
  return result;
}

export async function getVoteByBattleAndUser(battleId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(votes)
    .where(and(eq(votes.battleId, battleId), eq(votes.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getBattleVotes(battleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(votes).where(eq(votes.battleId, battleId));
}

// ============ Battle Stats ============

export async function upsertBattleStat(stat: InsertBattleStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(battleStats).values(stat).onDuplicateKeyUpdate({
    set: {
      battlesCount: sql`${battleStats.battlesCount} + ${stat.battlesCount || 0}`,
      winsCount: sql`${battleStats.winsCount} + ${stat.winsCount || 0}`,
      lossesCount: sql`${battleStats.lossesCount} + ${stat.lossesCount || 0}`,
      drawsCount: sql`${battleStats.drawsCount} + ${stat.drawsCount || 0}`,
      totalVotes: sql`${battleStats.totalVotes} + ${stat.totalVotes || 0}`,
    }
  });
}

export async function getModelStats(modelId: number, startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(battleStats.modelId, modelId)];
  
  if (startDate && endDate) {
    conditions.push(gte(battleStats.date, startDate));
    conditions.push(lte(battleStats.date, endDate));
  }
  
  return db.select().from(battleStats)
    .where(and(...conditions))
    .orderBy(desc(battleStats.date));
}

// ============ User Preferences ============

export async function upsertUserPreference(pref: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userPreferences).values(pref).onDuplicateKeyUpdate({
    set: {
      favoriteModels: pref.favoriteModels,
      emailNotifications: pref.emailNotifications,
      battleReminders: pref.battleReminders,
      updatedAt: new Date(),
    }
  });
}

export async function getUserPreference(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ============ Leaderboard ============

export async function getLeaderboard(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(aiModels)
    .where(eq(aiModels.isActive, 1))
    .orderBy(desc(aiModels.eloRating))
    .limit(limit);
}
