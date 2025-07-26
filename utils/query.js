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
            model: "kimi-k2-0711-preview", // Try moonshot-v1-8k, moonshot-v1-32k, or moonshot-v1-128k
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
            max_tokens: 1024,
        });
        return {
            output_text: response.choices[0].message.content
        };
    } catch (error) {
        console.error("Error in query function:", error);
        throw error;
    }
};

export const queryStream = async (message, res) => {
    try {
        let fullText = "";
        const stream = await client.chat.completions.create({
            model: "kimi-k2-0711-preview", // Try moonshot-v1-8k, moonshot-v1-32k, or moonshot-v1-128k
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
            max_tokens: 1024,
            stream: true
        });

        for await (const chunk of stream) {
            const contentChunk = chunk.choices[0]?.delta?.content || '';
            fullText += contentChunk;

            res.write(`data: ${JSON.stringify({ chunk: contentChunk })}\n\n`);
        }

        return fullText;

    } catch (error) {
        console.error("Error in query function:", error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
};