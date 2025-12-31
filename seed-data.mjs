import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { aiModels, battleTopics } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const modelsData = [
  { name: "GPT-4", provider: "openai", modelId: "gpt-4", description: "OpenAI's most capable model", category: "chat" },
  { name: "GPT-3.5 Turbo", provider: "openai", modelId: "gpt-3.5-turbo", description: "Fast and efficient GPT model", category: "chat" },
  { name: "Claude 3 Opus", provider: "anthropic", modelId: "claude-3-opus", description: "Anthropic's most powerful model", category: "chat" },
  { name: "Claude 3 Sonnet", provider: "anthropic", modelId: "claude-3-sonnet", description: "Balanced performance and speed", category: "chat" },
  { name: "Gemini Pro", provider: "google", modelId: "gemini-pro", description: "Google's advanced AI model", category: "chat" },
  { name: "Gemini Flash", provider: "google", modelId: "gemini-flash", description: "Fast multimodal model", category: "chat" },
];

const topicsData = [
  { title: "Creative Writing", prompt: "Write a short story about a time traveler who accidentally changes history", category: "creative", difficulty: "medium" },
  { title: "Code Explanation", prompt: "Explain how binary search works and provide a Python implementation", category: "technical", difficulty: "medium" },
  { title: "Philosophical Question", prompt: "What is consciousness and can AI truly be conscious?", category: "reasoning", difficulty: "hard" },
  { title: "Math Problem", prompt: "Solve this problem: If a train travels 120 miles in 2 hours, what is its average speed?", category: "technical", difficulty: "easy" },
  { title: "Recipe Creation", prompt: "Create a unique recipe using chicken, tomatoes, and basil", category: "creative", difficulty: "easy" },
  { title: "Historical Analysis", prompt: "Analyze the causes and effects of the Industrial Revolution", category: "reasoning", difficulty: "hard" },
  { title: "Business Strategy", prompt: "Develop a marketing strategy for a new eco-friendly product", category: "reasoning", difficulty: "medium" },
  { title: "Poetry", prompt: "Write a haiku about artificial intelligence", category: "creative", difficulty: "easy" },
  { title: "Debugging", prompt: "Find and explain the bug in this code: for(i=0; i<=10; i++) { arr[i] = i*2; }", category: "technical", difficulty: "medium" },
  { title: "Ethical Dilemma", prompt: "Discuss the ethical implications of autonomous vehicles in accident scenarios", category: "reasoning", difficulty: "hard" },
];

async function seed() {
  try {
    console.log("Seeding AI models...");
    await db.insert(aiModels).values(modelsData).onDuplicateKeyUpdate({ set: { name: aiModels.name } });
    
    console.log("Seeding battle topics...");
    await db.insert(battleTopics).values(topicsData);
    
    console.log("Seed completed successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await connection.end();
    process.exit(1);
  }
}

seed();
