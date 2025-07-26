import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";
import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

async function testEmotionAgent() {
    console.log('Testing emotion agent directly...');
    
    try {
        const testMessage = "I'm feeling really anxious about my upcoming presentation tomorrow. I keep overthinking everything that could go wrong.";
        
        // Load emotion prompt
        const promptPath = join(__dirname, "prompts", "emotion_nextgen.md");
        let promptContent;
        try {
            promptContent = await readFile(promptPath, "utf-8");
        } catch (error) {
            // Fallback to regular emotion prompt
            const fallbackPath = join(__dirname, "prompts", "emotion.md");
            promptContent = await readFile(fallbackPath, "utf-8");
        }
        
        console.log('Using prompt length:', promptContent.length);
        console.log('Calling emotion agent with message:', testMessage);
        
        const response = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: promptContent
                },
                {
                    role: "user",
                    content: testMessage
                }
            ],
            temperature: 0.7,
        });
        
        const content = response.choices[0].message.content;
        console.log('Agent response:', content);
        
    } catch (error) {
        console.error('Error testing emotion agent:', error);
    }
}

testEmotionAgent();
