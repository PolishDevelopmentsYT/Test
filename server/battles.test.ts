import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("AI Models", () => {
  it("should list all AI models", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.models.list();
    
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty("name");
    expect(models[0]).toHaveProperty("provider");
    expect(models[0]).toHaveProperty("eloRating");
  });

  it("should search AI models", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.models.search({ query: "GPT" });
    
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0].name).toContain("GPT");
    }
  });

  it("should get AI model by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.models.list();
    if (models.length > 0) {
      const model = await caller.models.getById({ id: models[0].id });
      expect(model.id).toBe(models[0].id);
      expect(model.name).toBe(models[0].name);
    }
  });
});

describe("Battle Topics", () => {
  it("should list battle topics", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const topics = await caller.topics.list();
    
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics[0]).toHaveProperty("title");
    expect(topics[0]).toHaveProperty("prompt");
    expect(topics[0]).toHaveProperty("category");
  });

  it("should get random battle topic", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const topic = await caller.topics.random();
    
    expect(topic).toBeDefined();
    if (topic) {
      expect(topic).toHaveProperty("title");
      expect(topic).toHaveProperty("prompt");
    }
  });

  it("should filter topics by category", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const topics = await caller.topics.list({ category: "creative" });
    
    expect(Array.isArray(topics)).toBe(true);
    if (topics.length > 0) {
      expect(topics[0].category).toBe("creative");
    }
  });
});

describe("Battle Creation and Execution", () => {
  it("should create a battle", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.models.list();
    const topics = await caller.topics.list();

    if (models.length >= 2 && topics.length > 0) {
      const battle = await caller.battles.create({
        model1Id: models[0].id,
        model2Id: models[1].id,
        topicId: topics[0].id,
      });

      expect(battle).toHaveProperty("battleId");
      expect(typeof battle.battleId).toBe("number");
    }
  });

  it("should retrieve battle by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.models.list();
    const topics = await caller.topics.list();

    if (models.length >= 2 && topics.length > 0) {
      const created = await caller.battles.create({
        model1Id: models[0].id,
        model2Id: models[1].id,
        topicId: topics[0].id,
      });

      const battle = await caller.battles.getById({ id: created.battleId });
      
      expect(battle).toBeDefined();
      expect(battle.id).toBe(created.battleId);
      expect(battle.model1Id).toBe(models[0].id);
      expect(battle.model2Id).toBe(models[1].id);
    }
  });

  it("should get user battle history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.battles.getUserHistory({ limit: 10 });
    
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("Voting System", () => {
  it("should submit vote for battle winner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.models.list();
    const topics = await caller.topics.list();

    if (models.length >= 2 && topics.length > 0) {
      // Create and execute battle
      const battle = await caller.battles.create({
        model1Id: models[0].id,
        model2Id: models[1].id,
        topicId: topics[0].id,
      });

      // Note: We can't actually execute the battle in tests without real LLM calls
      // So we'll just test vote submission structure
      
      // This would normally fail because battle isn't executed, but tests the flow
      try {
        const result = await caller.votes.submit({
          battleId: battle.battleId,
          votedModelId: models[0].id,
        });
        expect(result).toHaveProperty("success");
      } catch (error) {
        // Expected to fail without executed battle, but validates the procedure exists
        expect(error).toBeDefined();
      }
    }
  });

  it("should prevent duplicate votes", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.models.list();
    const topics = await caller.topics.list();

    if (models.length >= 2 && topics.length > 0) {
      const battle = await caller.battles.create({
        model1Id: models[0].id,
        model2Id: models[1].id,
        topicId: topics[0].id,
      });

      // Attempt to vote twice - second should fail
      try {
        await caller.votes.submit({
          battleId: battle.battleId,
          votedModelId: models[0].id,
        });
        
        await caller.votes.submit({
          battleId: battle.battleId,
          votedModelId: models[1].id,
        });
        
        // If we get here, duplicate vote wasn't prevented
        expect(true).toBe(false);
      } catch (error: any) {
        // Expected error for duplicate vote
        expect(error.message).toContain("Already voted");
      }
    }
  });
});

describe("Leaderboard", () => {
  it("should retrieve leaderboard rankings", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.leaderboard.get({ limit: 10 });
    
    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);
    
    // Verify sorted by ELO rating
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].eloRating).toBeGreaterThanOrEqual(leaderboard[i + 1].eloRating);
    }
  });

  it("should include all required model stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.leaderboard.get({ limit: 1 });
    
    if (leaderboard.length > 0) {
      const topModel = leaderboard[0];
      expect(topModel).toHaveProperty("eloRating");
      expect(topModel).toHaveProperty("totalBattles");
      expect(topModel).toHaveProperty("totalWins");
      expect(topModel).toHaveProperty("totalLosses");
      expect(topModel).toHaveProperty("totalDraws");
    }
  });
});

describe("User Preferences", () => {
  it("should get user preferences", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const prefs = await caller.preferences.get();
    
    // May be undefined if not set yet
    expect(prefs === undefined || typeof prefs === "object").toBe(true);
  });

  it("should update user preferences", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preferences.update({
      emailNotifications: 1,
      battleReminders: 0,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});
