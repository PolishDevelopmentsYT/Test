import { drizzle } from "drizzle-orm/mysql2";
import { battleTopics } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const shorterTopics = [
  // Creative Writing
  "Write a haiku about AI",
  "Create a short poem",
  "Write a funny joke",
  "Tell a scary story",
  "Write a love letter",
  
  // Problem Solving
  "Fix a broken code snippet",
  "Solve a math problem",
  "Debug this error",
  "Explain quantum computing",
  "How to learn coding fast?",
  
  // Analysis & Reasoning
  "Analyze this data",
  "Compare Python vs JavaScript",
  "What's the best strategy?",
  "Explain climate change",
  "Pros and cons of AI",
  
  // Practical Tasks
  "Write a resume summary",
  "Create a meal plan",
  "Plan a weekend trip",
  "Write a cover letter",
  "Make a workout routine",
  
  // Knowledge & Explanation
  "Explain blockchain simply",
  "What is machine learning?",
  "How does photosynthesis work?",
  "Explain cryptocurrency",
  "What is quantum entanglement?",
  
  // Creative Ideas
  "Brainstorm startup ideas",
  "Design a new product",
  "Create a marketing campaign",
  "Suggest a business name",
  "Invent a new holiday",
  
  // Quick Answers
  "What's the capital of France?",
  "Who won the 2024 World Cup?",
  "What's the fastest animal?",
  "How tall is Mount Everest?",
  "When was the internet invented?",
  
  // Debate & Opinion
  "Should we colonize Mars?",
  "Is remote work better?",
  "Should AI be regulated?",
  "Is social media good?",
  "Should college be free?",
  
  // Technical Help
  "How to set up a VPN?",
  "Best practices for cybersecurity",
  "How to optimize a website?",
  "Explain REST APIs",
  "What's a database index?",
  
  // Productivity
  "Best productivity tips",
  "How to manage time better?",
  "Overcome procrastination",
  "Build good habits",
  "Work-life balance tips",
  
  // Health & Wellness
  "Benefits of meditation",
  "How to sleep better?",
  "Healthy eating tips",
  "Best exercises for beginners",
  "How to reduce stress?",
  
  // Entertainment
  "Recommend a movie",
  "Suggest a book to read",
  "Best video games 2024",
  "Top Netflix shows",
  "Music recommendations",
  
  // Language & Communication
  "Translate to Spanish",
  "Improve my writing",
  "How to give feedback?",
  "Public speaking tips",
  "How to write better emails?",
  
  // Business & Finance
  "Explain stock market basics",
  "How to save money?",
  "Investment strategies",
  "Budgeting tips",
  "How to negotiate salary?",
  
  // Science & Nature
  "How do vaccines work?",
  "Explain evolution",
  "What causes earthquakes?",
  "How do plants grow?",
  "What is dark matter?",
  
  // History & Culture
  "Tell me about Ancient Rome",
  "What caused WW2?",
  "Explain the Renaissance",
  "History of the internet",
  "Famous inventors",
  
  // Philosophy & Ethics
  "What is consciousness?",
  "Define artificial intelligence",
  "What is ethics?",
  "Explain free will",
  "What is happiness?",
  
  // Lifestyle
  "Fashion tips for men",
  "Fashion tips for women",
  "How to cook pasta?",
  "Best coffee brewing method",
  "Home decoration ideas",
  
  // Education
  "How to study effectively?",
  "Best learning techniques",
  "How to take good notes?",
  "Test preparation tips",
  "How to improve memory?",
  
  // Social & Relationships
  "How to make friends?",
  "Relationship advice",
  "How to handle conflict?",
  "Improve communication",
  "How to be more confident?",
];

async function seedTopics() {
  console.log(`Seeding ${shorterTopics.length} battle topics...`);
  
  try {
    // Clear existing topics
    await db.delete(battleTopics);
    
    // Insert new topics in batches
    const batchSize = 10;
    for (let i = 0; i < shorterTopics.length; i += batchSize) {
      const batch = shorterTopics.slice(i, i + batchSize).map((topic) => ({
        title: topic,
        prompt: topic,
        difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)],
        category: "general",
        isActive: 1,
      }));
      
      await db.insert(battleTopics).values(batch);
      console.log(`  Seeded ${Math.min(i + batchSize, shorterTopics.length)}/${shorterTopics.length} topics...`);
    }
    
    console.log("✓ Topics seeded successfully!");
  } catch (error) {
    console.error("Error seeding topics:", error);
    process.exit(1);
  }
}

seedTopics();
