import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

// ELO rating calculation
function calculateEloRating(winnerRating: number, loserRating: number, isDraw: boolean = false): { winnerNew: number; loserNew: number } {
  const K = 32; // K-factor
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  if (isDraw) {
    return {
      winnerNew: Math.round(winnerRating + K * (0.5 - expectedWinner)),
      loserNew: Math.round(loserRating + K * (0.5 - expectedLoser)),
    };
  }
  
  return {
    winnerNew: Math.round(winnerRating + K * (1 - expectedWinner)),
    loserNew: Math.round(loserRating + K * (0 - expectedLoser)),
  };
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // AI Models Management
  models: router({
    list: publicProcedure
      .input(z.object({
        provider: z.string().optional(),
        category: z.string().optional(),
        isActive: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAiModels(input);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return db.searchAiModels(input.query);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const model = await db.getAiModelById(input.id);
        if (!model) throw new TRPCError({ code: "NOT_FOUND", message: "Model not found" });
        return model;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        provider: z.string(),
        modelId: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return db.createAiModel(input);
      }),
  }),

  // Battle Topics Management
  topics: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getBattleTopics(input);
      }),

    random: publicProcedure
      .query(async () => {
        return db.getRandomBattleTopic();
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        prompt: z.string(),
        category: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
        }
        return db.createBattleTopic(input);
      }),
  }),

  // Battle Management
  battles: router({
    create: protectedProcedure
      .input(z.object({
        model1Id: z.number(),
        model2Id: z.number(),
        topicId: z.number(),
        customPrompt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const battleId = await db.createBattle({
          userId: ctx.user.id,
          model1Id: input.model1Id,
          model2Id: input.model2Id,
          topicId: input.topicId,
          customPrompt: input.customPrompt,
          status: "pending",
        });
        
        await db.incrementTopicUsage(input.topicId);
        
        return { battleId };
      }),

    execute: protectedProcedure
      .input(z.object({
        battleId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const battle = await db.getBattleById(input.battleId);
        if (!battle) throw new TRPCError({ code: "NOT_FOUND", message: "Battle not found" });
        
        const [model1, model2, topic] = await Promise.all([
          db.getAiModelById(battle.model1Id),
          db.getAiModelById(battle.model2Id),
          (async () => {
            const database = await db.getDb();
            if (!database) return undefined;
            const { battleTopics } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const result = await database.select().from(battleTopics).where(eq(battleTopics.id, battle.topicId)).limit(1);
            return result[0];
          })(),
        ]);
        
        if (!model1 || !model2 || !topic) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Battle data incomplete" });
        }
        
        const prompt = battle.customPrompt || topic.prompt;
        
        // Execute both AI models in parallel
        const startTime1 = Date.now();
        const startTime2 = Date.now();
        
        try {
          const [response1, response2] = await Promise.all([
            invokeLLM({ messages: [{ role: "user", content: prompt }] }),
            invokeLLM({ messages: [{ role: "user", content: prompt }] }),
          ]);
          
          const responseTime1 = Date.now() - startTime1;
          const responseTime2 = Date.now() - startTime2;
          
          const model1Response = typeof response1.choices[0]?.message?.content === 'string' 
            ? response1.choices[0].message.content 
            : "";
          const model2Response = typeof response2.choices[0]?.message?.content === 'string' 
            ? response2.choices[0].message.content 
            : "";
          
          await db.updateBattle(input.battleId, {
            model1Response,
            model2Response,
            model1ResponseTime: responseTime1,
            model2ResponseTime: responseTime2,
            status: "completed",
            completedAt: new Date(),
          });
          
          // Update model battle counts
          await Promise.all([
            db.updateAiModelStats(model1.id, { totalBattles: model1.totalBattles + 1 }),
            db.updateAiModelStats(model2.id, { totalBattles: model2.totalBattles + 1 }),
          ]);
          
          return {
            success: true,
            model1Response,
            model2Response,
            model1ResponseTime: responseTime1,
            model2ResponseTime: responseTime2,
          };
        } catch (error) {
          await db.updateBattle(input.battleId, { status: "error" });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Battle execution failed" });
        }
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const battle = await db.getBattleById(input.id);
        if (!battle) throw new TRPCError({ code: "NOT_FOUND", message: "Battle not found" });
        return battle;
      }),

    getUserHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return db.getUserBattles(ctx.user.id, input.limit);
      }),

    getRecent: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return db.getRecentBattles(input.limit);
      }),
  }),

  // Voting System
  votes: router({
    submit: protectedProcedure
      .input(z.object({
        battleId: z.number(),
        votedModelId: z.number().nullable(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user already voted
        const existingVote = await db.getVoteByBattleAndUser(input.battleId, ctx.user.id);
        if (existingVote) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Already voted on this battle" });
        }
        
        const battle = await db.getBattleById(input.battleId);
        if (!battle) throw new TRPCError({ code: "NOT_FOUND", message: "Battle not found" });
        
        await db.createVote({
          battleId: input.battleId,
          userId: ctx.user.id,
          votedModelId: input.votedModelId,
          comment: input.comment,
        });
        
        // Update battle winner
        if (input.votedModelId) {
          await db.updateBattle(input.battleId, { winnerId: input.votedModelId });
          
          // Update model stats
          const [model1, model2] = await Promise.all([
            db.getAiModelById(battle.model1Id),
            db.getAiModelById(battle.model2Id),
          ]);
          
          if (model1 && model2) {
            const winnerId = input.votedModelId;
            const loserId = winnerId === model1.id ? model2.id : model1.id;
            const winner = winnerId === model1.id ? model1 : model2;
            const loser = winnerId === model1.id ? model2 : model1;
            
            const { winnerNew, loserNew } = calculateEloRating(winner.eloRating, loser.eloRating);
            
            await Promise.all([
              db.updateAiModelStats(winnerId, {
                totalWins: winner.totalWins + 1,
                eloRating: winnerNew,
              }),
              db.updateAiModelStats(loserId, {
                totalLosses: loser.totalLosses + 1,
                eloRating: loserNew,
              }),
            ]);
          }
        } else {
          // Draw
          const [model1, model2] = await Promise.all([
            db.getAiModelById(battle.model1Id),
            db.getAiModelById(battle.model2Id),
          ]);
          
          if (model1 && model2) {
            const { winnerNew, loserNew } = calculateEloRating(model1.eloRating, model2.eloRating, true);
            
            await Promise.all([
              db.updateAiModelStats(model1.id, {
                totalDraws: model1.totalDraws + 1,
                eloRating: winnerNew,
              }),
              db.updateAiModelStats(model2.id, {
                totalDraws: model2.totalDraws + 1,
                eloRating: loserNew,
              }),
            ]);
          }
        }
        
        return { success: true };
      }),

    getBattleVotes: publicProcedure
      .input(z.object({ battleId: z.number() }))
      .query(async ({ input }) => {
        return db.getBattleVotes(input.battleId);
      }),
  }),

  // Leaderboard
  leaderboard: router({
    get: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getLeaderboard(input.limit);
      }),
  }),

  // User Preferences
  preferences: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserPreference(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        favoriteModels: z.string().optional(),
        emailNotifications: z.number().optional(),
        battleReminders: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertUserPreference({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Statistics
  stats: router({
    getModelStats: publicProcedure
      .input(z.object({
        modelId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return db.getModelStats(input.modelId, input.startDate, input.endDate);
      }),
  }),

  // External AI Model Search
  aiSearch: router({
    searchGoogle: publicProcedure
      .input(z.object({
        query: z.string(),
      }))
      .query(async ({ input }) => {
        // This would integrate with search API in production
        // For now, return placeholder structure
        return {
          results: [],
          message: "External search integration - use search APIs to find AI models",
        };
      }),
    
    addDiscoveredModel: protectedProcedure
      .input(z.object({
        name: z.string(),
        provider: z.string(),
        modelId: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        source: z.string().optional(), // "google", "appstore", "playstore", "manual"
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        
        const { aiModels } = await import("../drizzle/schema");
        
        // Check if model already exists
        const { eq } = await import("drizzle-orm");
        const existing = await database.select().from(aiModels)
          .where(eq(aiModels.modelId, input.modelId))
          .limit(1);
        
        if (existing.length > 0) {
          return { success: false, message: "Model already exists", modelId: existing[0].id };
        }
        
        // Add new model
        const result = await database.insert(aiModels).values({
          name: input.name,
          provider: input.provider,
          modelId: input.modelId,
          description: input.description || `${input.name} by ${input.provider}`,
          category: input.category || "chat",
          eloRating: 1500,
          isActive: 1,
        });
        
        const insertId = (result as any).insertId || 0;
        
        return { 
          success: true, 
          message: "Model added successfully",
          modelId: Number(insertId),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
