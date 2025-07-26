import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

async function testDirectLLM() {
    console.log('🧪 Testing Direct LLM Connection');
    console.log('================================');
    
    try {
        console.log('Making API call...');
        const response = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant. Respond briefly and clearly."
                },
                {
                    role: "user",
                    content: "Hello, please respond with 'API connection successful!' and current time."
                }
            ],
            temperature: 0.7,
        });
        
        console.log('✅ API Response:', response.choices[0].message.content);
        return true;
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        return false;
    }
}

async function testStreamingLLM() {
    console.log('\n🧪 Testing Streaming LLM Connection');
    console.log('===================================');
    
    try {
        console.log('Making streaming API call...');
        const stream = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant."
                },
                {
                    role: "user",
                    content: "Count from 1 to 5, one number per response chunk."
                }
            ],
            temperature: 0.7,
            stream: true
        });

        let fullText = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullText += content;
            process.stdout.write(content);
        }
        
        console.log('\n✅ Streaming Response Complete:', fullText.trim());
        return true;
        
    } catch (error) {
        console.error('❌ Streaming Error:', error.message);
        return false;
    }
}

async function runLLMTests() {
    const directTest = await testDirectLLM();
    const streamTest = await testStreamingLLM();
    
    console.log('\n📊 Test Results:');
    console.log(`Direct LLM: ${directTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Streaming LLM: ${streamTest ? '✅ PASS' : '❌ FAIL'}`);
    
    if (directTest && streamTest) {
        console.log('🎉 LLM API is working correctly!');
        console.log('💡 The issue might be in the agent framework or workflow logic.');
    } else {
        console.log('⚠️ LLM API has issues that need to be resolved first.');
    }
}

runLLMTests();
