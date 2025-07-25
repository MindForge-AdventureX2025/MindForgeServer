import OpenAI from "openai";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

// Use absolute path to avoid path resolution issues
const systemPromptPath = join(__dirname, "..", "prompts", "system.md");
const data = await readFile(systemPromptPath, "utf-8");

export const query = async (message) => {
    try {
        const response = await client.chat.completions.create({
            model: "moonshot-v1-8k",
            messages: [
                {
                    role: "system",
                    content: data
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            stream: true,
        });
        
        return {
            output_text: response.choices[0].message.content
        };
    } catch (error) {
        console.error("Error in query function:", error);
        throw error;
    }
};