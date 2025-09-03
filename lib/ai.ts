// OpenRouter + Vercel AI SDK integration helper
// Requires: npm i @openrouter/ai-sdk-provider (already added) and env OPENROUTER_API_KEY
// Docs: https://openrouter.ai/docs/community/vercel-ai-sdk
import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  // Optional: forward required headers
  headers: {
    "HTTP-Referer":
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
    "X-Title": "OneMove",
  },
});

export interface AISummaryResult {
  summary: string;
  encouragement: string;
}

export async function generateWeeklySummary(
  prompt: string
): Promise<AISummaryResult | null> {
  if (!process.env.OPENROUTER_API_KEY) return null;
  try {
    const modelId =
      process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3.1:free"; // can override
    const { text } = await generateText({
      model: openrouter(modelId),
      maxOutputTokens: 400,
      temperature: 0.7,
      prompt: `${prompt}\nRespond ONLY with valid minified JSON {"summary":"...","encouragement":"..."}.`,
    });
    // Attempt to extract JSON
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        const parsed = JSON.parse(text.slice(start, end + 1));
        if (parsed.summary && parsed.encouragement) {
          return {
            summary: String(parsed.summary).slice(0, 600),
            encouragement: String(parsed.encouragement).slice(0, 200),
          };
        }
      } catch {
        /* fall through */
      }
    }
    return {
      summary: text.trim().slice(0, 600),
      encouragement: "Keep the streak going tomorrow!",
    };
  } catch (err) {
    console.error("OpenRouter weekly summary failed", err);
    return null;
  }
}
