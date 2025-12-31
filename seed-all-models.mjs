import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { aiModels } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const allModels = [
  // Major AI Chatbots & Assistants
  { name: "ChatGPT", provider: "openai", modelId: "gpt-4", description: "OpenAI's most capable model", category: "chat" },
  { name: "GPT-4o", provider: "openai", modelId: "gpt-4o", description: "Optimized GPT-4 model", category: "chat" },
  { name: "GPT-4o mini", provider: "openai", modelId: "gpt-4o-mini", description: "Compact GPT-4o variant", category: "chat" },
  { name: "GPT-3.5 Turbo", provider: "openai", modelId: "gpt-3.5-turbo", description: "Fast and efficient GPT model", category: "chat" },
  { name: "Claude 3 Opus", provider: "anthropic", modelId: "claude-3-opus", description: "Anthropic's most powerful model", category: "chat" },
  { name: "Claude 3 Sonnet", provider: "anthropic", modelId: "claude-3-sonnet", description: "Balanced performance and speed", category: "chat" },
  { name: "Claude 3.5 Sonnet", provider: "anthropic", modelId: "claude-3.5-sonnet", description: "Enhanced Sonnet model", category: "chat" },
  { name: "Claude 2.1", provider: "anthropic", modelId: "claude-2.1", description: "Previous generation Claude", category: "chat" },
  { name: "Gemini Pro", provider: "google", modelId: "gemini-pro", description: "Google's advanced AI model", category: "chat" },
  { name: "Gemini Flash", provider: "google", modelId: "gemini-flash", description: "Fast multimodal model", category: "chat" },
  { name: "Gemini Ultra", provider: "google", modelId: "gemini-ultra", description: "Google's most capable model", category: "chat" },
  { name: "Microsoft Copilot", provider: "microsoft", modelId: "copilot", description: "Microsoft's AI assistant", category: "chat" },
  { name: "DeepSeek", provider: "deepseek", modelId: "deepseek-r1", description: "DeepSeek's reasoning model", category: "chat" },
  { name: "Grok", provider: "xai", modelId: "grok-1", description: "xAI's conversational model", category: "chat" },
  { name: "Grok-2", provider: "xai", modelId: "grok-2", description: "Enhanced Grok model", category: "chat" },
  { name: "Meta AI", provider: "meta", modelId: "llama-3.1", description: "Meta's AI assistant", category: "chat" },
  { name: "Llama 3.1", provider: "meta", modelId: "llama-3.1-405b", description: "Meta's largest open model", category: "chat" },
  { name: "Llama 3", provider: "meta", modelId: "llama-3-70b", description: "Meta's powerful open model", category: "chat" },
  { name: "Llama 2", provider: "meta", modelId: "llama-2-70b", description: "Meta's previous generation", category: "chat" },
  { name: "Perplexity AI", provider: "perplexity", modelId: "sonar", description: "Search-focused AI", category: "chat" },
  { name: "Pi", provider: "inflection", modelId: "pi", description: "Personal Intelligence assistant", category: "chat" },
  { name: "Poe", provider: "quora", modelId: "poe", description: "Multi-model platform", category: "chat" },

  // Voice Assistants
  { name: "Alexa", provider: "amazon", modelId: "alexa", description: "Amazon's voice assistant", category: "voice" },
  { name: "Siri", provider: "apple", modelId: "siri", description: "Apple's voice assistant", category: "voice" },
  { name: "Google Assistant", provider: "google", modelId: "google-assistant", description: "Google's voice assistant", category: "voice" },
  { name: "Bixby", provider: "samsung", modelId: "bixby", description: "Samsung's voice assistant", category: "voice" },
  { name: "Cortana", provider: "microsoft", modelId: "cortana", description: "Microsoft's voice assistant (deprecated)", category: "voice" },
  { name: "Celia", provider: "huawei", modelId: "celia", description: "Huawei's voice assistant", category: "voice" },

  // Chinese AI Models
  { name: "Ernie Bot", provider: "baidu", modelId: "ernie-bot", description: "Baidu's AI chatbot", category: "chat" },
  { name: "Wenxin Yiyan", provider: "baidu", modelId: "wenxin", description: "Baidu's language model", category: "chat" },
  { name: "GigaChat", provider: "sberbank", modelId: "gigachat", description: "Russian AI assistant", category: "chat" },
  { name: "Qwen", provider: "alibaba", modelId: "qwen-2", description: "Alibaba's AI model", category: "chat" },
  { name: "Tongyi Qianwen", provider: "alibaba", modelId: "tongyi", description: "Alibaba's language model", category: "chat" },
  { name: "Doubao", provider: "bytedance", modelId: "doubao", description: "ByteDance's AI assistant", category: "chat" },
  { name: "SparkDesk", provider: "iflytek", modelId: "sparkdesk", description: "iFlytek's AI model", category: "chat" },
  { name: "ChatGLM", provider: "zhipu", modelId: "chatglm", description: "Zhipu AI's model", category: "chat" },
  { name: "HKChat", provider: "hkchat", modelId: "hkgai-v1", description: "Hong Kong AI model", category: "chat" },
  { name: "Alice", provider: "yandex", modelId: "yandexgpt", description: "Yandex's AI assistant", category: "chat" },
  { name: "AliGenie", provider: "alibaba", modelId: "aligenie", description: "Alibaba's voice assistant", category: "voice" },
  { name: "Clova", provider: "naver", modelId: "clova", description: "Naver's AI assistant", category: "voice" },
  { name: "Xiaowei", provider: "tencent", modelId: "xiaowei", description: "Tencent's voice assistant", category: "voice" },

  // Coding AI Assistants
  { name: "GitHub Copilot", provider: "github", modelId: "copilot", description: "AI pair programmer", category: "coding" },
  { name: "Tabnine", provider: "tabnine", modelId: "tabnine", description: "AI code completion", category: "coding" },
  { name: "Amazon Q Developer", provider: "amazon", modelId: "amazon-q", description: "AWS coding assistant", category: "coding" },
  { name: "Cursor AI", provider: "cursor", modelId: "cursor", description: "AI-powered code editor", category: "coding" },
  { name: "Replit AI", provider: "replit", modelId: "replit-ai", description: "Collaborative coding AI", category: "coding" },
  { name: "Codeium", provider: "codeium", modelId: "codeium", description: "Free AI code completion", category: "coding" },
  { name: "Sourcegraph Cody", provider: "sourcegraph", modelId: "cody", description: "AI coding assistant", category: "coding" },
  { name: "CodeWhisperer", provider: "amazon", modelId: "codewhisperer", description: "AWS code generator", category: "coding" },
  { name: "Warp AI", provider: "warp", modelId: "warp-ai", description: "Terminal with AI", category: "coding" },
  { name: "Qodo", provider: "qodo", modelId: "qodo", description: "AI code quality tool", category: "coding" },
  { name: "Blackbox AI", provider: "blackbox", modelId: "blackbox", description: "Code search AI", category: "coding" },
  { name: "Phind", provider: "phind", modelId: "phind", description: "Developer search AI", category: "coding" },
  { name: "AskCodi", provider: "askcodi", modelId: "askcodi", description: "AI coding helper", category: "coding" },
  { name: "Bito AI", provider: "bito", modelId: "bito", description: "AI dev assistant", category: "coding" },

  // Content Writing AI
  { name: "Jasper AI", provider: "jasper", modelId: "jasper", description: "AI content writer", category: "writing" },
  { name: "Copy.ai", provider: "copyai", modelId: "copyai", description: "Marketing copy generator", category: "writing" },
  { name: "Writesonic", provider: "writesonic", modelId: "writesonic", description: "AI writing assistant", category: "writing" },
  { name: "Rytr", provider: "rytr", modelId: "rytr", description: "AI writing tool", category: "writing" },
  { name: "Anyword", provider: "anyword", modelId: "anyword", description: "Data-driven copywriting", category: "writing" },
  { name: "Wordtune", provider: "wordtune", modelId: "wordtune", description: "AI writing companion", category: "writing" },
  { name: "QuillBot", provider: "quillbot", modelId: "quillbot", description: "Paraphrasing tool", category: "writing" },
  { name: "Grammarly AI", provider: "grammarly", modelId: "grammarly", description: "Writing enhancement AI", category: "writing" },
  { name: "Notion AI", provider: "notion", modelId: "notion-ai", description: "Workspace AI assistant", category: "writing" },

  // Transcription & Meeting AI
  { name: "Otter.ai", provider: "otter", modelId: "otter", description: "Meeting transcription", category: "transcription" },
  { name: "Fireflies.ai", provider: "fireflies", modelId: "fireflies", description: "AI meeting assistant", category: "transcription" },
  { name: "Krisp", provider: "krisp", modelId: "krisp", description: "Noise cancellation AI", category: "audio" },
  { name: "Descript", provider: "descript", modelId: "descript", description: "Audio/video editor", category: "media" },

  // Image Generation AI
  { name: "DALL-E 3", provider: "openai", modelId: "dall-e-3", description: "Advanced image generation", category: "image" },
  { name: "DALL-E 2", provider: "openai", modelId: "dall-e-2", description: "Image generation model", category: "image" },
  { name: "Midjourney", provider: "midjourney", modelId: "midjourney-v6", description: "AI art generator", category: "image" },
  { name: "Stable Diffusion", provider: "stability", modelId: "sdxl", description: "Open source image AI", category: "image" },
  { name: "Adobe Firefly", provider: "adobe", modelId: "firefly", description: "Creative AI suite", category: "image" },
  { name: "Leonardo.ai", provider: "leonardo", modelId: "leonardo", description: "AI art platform", category: "image" },
  { name: "Ideogram", provider: "ideogram", modelId: "ideogram", description: "Text-to-image AI", category: "image" },
  { name: "Playground AI", provider: "playground", modelId: "playground", description: "Image creation platform", category: "image" },

  // Mobile AI Apps
  { name: "Genie AI", provider: "genie", modelId: "genie", description: "Mobile AI chatbot", category: "mobile" },
  { name: "ChatBox AI", provider: "chatbox", modelId: "chatbox", description: "Multi-model mobile app", category: "mobile" },
  { name: "Nova AI", provider: "nova", modelId: "nova", description: "AI assistant app", category: "mobile" },
  { name: "Frank AI", provider: "frank", modelId: "frank", description: "Mobile AI helper", category: "mobile" },
  { name: "Character.AI", provider: "character", modelId: "character-ai", description: "Conversational AI", category: "mobile" },
  { name: "Replika", provider: "replika", modelId: "replika", description: "AI companion", category: "mobile" },
  { name: "Chai", provider: "chai", modelId: "chai", description: "Chatbot platform", category: "mobile" },
  { name: "Anima AI", provider: "anima", modelId: "anima", description: "Virtual friend", category: "mobile" },
  { name: "SimSimi", provider: "simsimi", modelId: "simsimi", description: "Conversation bot", category: "mobile" },
  { name: "Kuki AI", provider: "kuki", modelId: "kuki", description: "Award-winning chatbot", category: "mobile" },

  // Productivity AI
  { name: "Motion AI", provider: "motion", modelId: "motion", description: "Calendar AI", category: "productivity" },
  { name: "Reclaim AI", provider: "reclaim", modelId: "reclaim", description: "Smart scheduling", category: "productivity" },
  { name: "Trevor AI", provider: "trevor", modelId: "trevor", description: "Task planner", category: "productivity" },
  { name: "Clockwise", provider: "clockwise", modelId: "clockwise", description: "Calendar optimizer", category: "productivity" },

  // Search & Research AI
  { name: "You.com", provider: "you", modelId: "you-chat", description: "AI search engine", category: "search" },
  { name: "Andi Search", provider: "andi", modelId: "andi", description: "Conversational search", category: "search" },
  { name: "Consensus", provider: "consensus", modelId: "consensus", description: "Research AI", category: "research" },
  { name: "Elicit", provider: "elicit", modelId: "elicit", description: "Research assistant", category: "research" },
  { name: "Scholarcy", provider: "scholarcy", modelId: "scholarcy", description: "Paper summarizer", category: "research" },

  // Business & Enterprise AI
  { name: "Salesforce Einstein", provider: "salesforce", modelId: "einstein", description: "CRM AI", category: "business" },
  { name: "HubSpot AI", provider: "hubspot", modelId: "hubspot-ai", description: "Marketing AI", category: "business" },
  { name: "Zendesk AI", provider: "zendesk", modelId: "zendesk-ai", description: "Customer service AI", category: "business" },
  { name: "Intercom Fin", provider: "intercom", modelId: "fin", description: "Support AI", category: "business" },
  { name: "Drift AI", provider: "drift", modelId: "drift-ai", description: "Conversational marketing", category: "business" },

  // Education AI
  { name: "Socratic", provider: "google", modelId: "socratic", description: "Homework helper", category: "education" },
  { name: "Khan Academy Khanmigo", provider: "khan", modelId: "khanmigo", description: "AI tutor", category: "education" },
  { name: "Duolingo Max", provider: "duolingo", modelId: "duolingo-max", description: "Language learning AI", category: "education" },
  { name: "Quizlet AI", provider: "quizlet", modelId: "quizlet-ai", description: "Study assistant", category: "education" },
  { name: "Photomath", provider: "photomath", modelId: "photomath", description: "Math solver", category: "education" },

  // Video AI
  { name: "Synthesia", provider: "synthesia", modelId: "synthesia", description: "AI video generation", category: "video" },
  { name: "HeyGen", provider: "heygen", modelId: "heygen", description: "Avatar video creator", category: "video" },
  { name: "Runway ML", provider: "runway", modelId: "runway", description: "Creative AI suite", category: "video" },
  { name: "Pictory", provider: "pictory", modelId: "pictory", description: "Video creation AI", category: "video" },

  // Audio & Music AI
  { name: "Suno AI", provider: "suno", modelId: "suno", description: "Music generation", category: "audio" },
  { name: "Mubert", provider: "mubert", modelId: "mubert", description: "AI music platform", category: "audio" },
  { name: "AIVA", provider: "aiva", modelId: "aiva", description: "AI composer", category: "audio" },
  { name: "Soundraw", provider: "soundraw", modelId: "soundraw", description: "Music generator", category: "audio" },

  // Open Source Models
  { name: "Mistral AI", provider: "mistral", modelId: "mistral-large", description: "Open source LLM", category: "opensource" },
  { name: "Mixtral 8x7B", provider: "mistral", modelId: "mixtral-8x7b", description: "Mixture of experts", category: "opensource" },
  { name: "Falcon", provider: "tii", modelId: "falcon-180b", description: "Open source model", category: "opensource" },
  { name: "Bloom", provider: "bigscience", modelId: "bloom", description: "Multilingual model", category: "opensource" },
  { name: "Vicuna", provider: "lmsys", modelId: "vicuna-33b", description: "Open chatbot", category: "opensource" },
  { name: "Alpaca", provider: "stanford", modelId: "alpaca", description: "Instruction-following model", category: "opensource" },

  // Legacy/Historical
  { name: "ELIZA", provider: "mit", modelId: "eliza", description: "First chatbot (1964)", category: "historical" },
  { name: "Cleverbot", provider: "rollo", modelId: "cleverbot", description: "Learning chatbot", category: "historical" },
  { name: "Jabberwacky", provider: "rollo", modelId: "jabberwacky", description: "Early AI chat", category: "historical" },
  { name: "ALICE", provider: "wallace", modelId: "alice", description: "AIML-based bot", category: "historical" },

  // Additional Specialized
  { name: "Cohere", provider: "cohere", modelId: "command", description: "Enterprise AI", category: "chat" },
  { name: "AI21 Jurassic", provider: "ai21", modelId: "jurassic-2", description: "Language model", category: "chat" },
  { name: "Braina", provider: "brainasoft", modelId: "braina", description: "Windows AI assistant", category: "desktop" },
  { name: "Ultra Hal", provider: "medeksza", modelId: "ultra-hal", description: "Virtual assistant", category: "desktop" },
  { name: "Leo", provider: "brave", modelId: "leo", description: "Browser AI", category: "browser" },
  { name: "Bing Chat", provider: "microsoft", modelId: "bing-chat", description: "Search AI (now Copilot)", category: "search" },
  { name: "YouChat", provider: "you", modelId: "youchat", description: "Search assistant", category: "search" },
];

async function seedAllModels() {
  try {
    console.log(`Seeding ${allModels.length} AI models...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const model of allModels) {
      try {
        await db.insert(aiModels).values(model).onDuplicateKeyUpdate({ 
          set: { 
            name: model.name,
            description: model.description,
            category: model.category
          } 
        });
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  Seeded ${successCount}/${allModels.length} models...`);
        }
      } catch (err) {
        console.error(`  Error seeding ${model.name}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n✓ Seed completed!`);
    console.log(`  Success: ${successCount} models`);
    console.log(`  Errors: ${errorCount} models`);
    console.log(`  Total: ${allModels.length} models`);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await connection.end();
    process.exit(1);
  }
}

seedAllModels();
