import OpenAI from "openai";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

const __dirname = path.resolve();

const data = await readFile(path.join(__dirname, "/prompts/system.md"), "utf-8");

export const query = async (message) => {
    await client.responses.create({
        model: "kimi-k2-0711-preview",
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
        stream: true,
        background: true,
    });
};