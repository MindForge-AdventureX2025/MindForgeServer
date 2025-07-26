import { Agent, run } from "@openai/agents";
import OpenAI from "openai";
import dotenv from "dotenv"
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path"

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

const supervisorInstructions = await readFile(join(__dirname, "..", "prompts", "supervisor.md"), "utf-8");
const retrievalInstructions = await readFile(join(__dirname, "..", "prompts", "retrieval.md"), "utf-8");
const summarizationInstructions = await readFile(join(__dirname, "..", "prompts", "summarization.md"), "utf-8");
const tagsInstructions = await readFile(join(__dirname, "..", "prompts", "tags.md"), "utf-8");
const enhancementInstructions = await readFile(join(__dirname, "..", "prompts", "enhancement.md"), "utf-8");
const memoryInstructions = await readFile(join(__dirname, "..", "prompts", "memory.md"), "utf-8");
const reportInstructions = await readFile(join(__dirname, "..", "prompts", "report.md"), "utf-8");
const monitorInstructions = await readFile(join(__dirname, "..", "prompts", "monitor.md"), "utf-8");

export const supervisor_agent = new Agent({
    name: 'supervisor',
    instructions: supervisorInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const retrieval_agent = new Agent({
    name: 'retrieval',
    instructions: retrievalInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const summarization_agent = new Agent({
    name: 'summarization',
    instructions: summarizationInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const tags_agent = new Agent({
    name: 'tags',
    instructions: tagsInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const enhancement_agent = new Agent({
    name: 'enhancement',
    instructions: enhancementInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const memory_agent = new Agent({
    name: 'memory',
    instructions: memoryInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const report_agent = new Agent({
    name: 'report',
    instructions: reportInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})

export const monitor_agent = new Agent({
    name: 'monitor',
    instructions: monitorInstructions || 'only output what you received and your name',
    model: 'kimi-k2-0711-preview',
})