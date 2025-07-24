import OpenAI from "openai";
const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

export const query = async (message) => {
    await client.responses.create({
        model: "kimi-k2-0711-preview",
        messages: [
            {
                role: "system",
                content: await fetch("../prompts/system.md").then(res => res.text())
            },
            {
                role: "user",
                content: message
            }
        ]
    });
};