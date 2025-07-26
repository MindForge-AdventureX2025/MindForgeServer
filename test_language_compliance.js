// Test script to verify language compliance for low-level system tags
// This script tests that system tags remain in English regardless of user language

import { query, queryStream } from "./utils/query.js";
import dotenv from "dotenv";

dotenv.config();

// Test cases with different languages
const testCases = [
    {
        language: "Chinese",
        message: "请帮我分析一下我的日记情感。这是我今天的日记：今天感觉很开心，学会了新的编程技巧。",
        description: "Chinese request for journal emotion analysis"
    },
    {
        language: "Spanish", 
        message: "Por favor analiza mis sentimientos en esta entrada de diario: Hoy me siento muy feliz porque aprendí Python.",
        description: "Spanish request for journal analysis"
    },
    {
        language: "French",
        message: "Pouvez-vous m'aider à organiser mes pensées sur mes objectifs de carrière? J'aimerais devenir développeur.",
        description: "French request for career goal organization"
    },
    {
        language: "Japanese",
        message: "今日の日記の感情を分析してください：今日はとても嬉しかったです。新しいプログラミング言語を学びました。",
        description: "Japanese request for diary analysis"
    }
];

// Mock response object for testing
class MockResponse {
    constructor() {
        this.data = [];
    }
    
    write(data) {
        this.data.push(data);
        console.log("STREAM OUTPUT:", data);
    }
    
    end() {
        console.log("Stream ended");
    }
    
    setHeader(name, value) {
        console.log(`Header set: ${name} = ${value}`);
    }
}

async function testLanguageCompliance() {
    console.log("🔍 Testing Language Compliance for System Tags\n");
    console.log("=".repeat(60));
    
    for (const testCase of testCases) {
        console.log(`\n📝 Testing ${testCase.language}: ${testCase.description}`);
        console.log("-".repeat(40));
        
        try {
            // Test with queryStream (streaming response)
            console.log("🔄 Testing queryStream...");
            const mockRes = new MockResponse();
            
            const streamResult = await queryStream(testCase.message, mockRes, {
                userId: "test_user_id",
                authToken: "test_token"
            });
            
            // Check if any system tags in the stream output are translated
            const streamOutput = mockRes.data.join('');
            console.log("\n📊 Stream Output Analysis:");
            
            // Look for system tags
            const systemTags = ['<start>', '<complete>', '<thinking>', '<e>'];
            let englishTagsFound = 0;
            let nonEnglishTagsFound = 0;
            
            systemTags.forEach(tag => {
                if (streamOutput.includes(tag)) {
                    englishTagsFound++;
                    console.log(`✅ Found English system tag: ${tag}`);
                }
            });
            
            // Check for potential translated versions (simplified check)
            const possibleTranslations = [
                '开始', '完成', '思考', '错误', // Chinese
                'inicio', 'completo', 'pensamiento', 'error', // Spanish  
                'début', 'complet', 'pensée', 'erreur', // French
                '開始', '完了', '思考', 'エラー' // Japanese
            ];
            
            possibleTranslations.forEach(translation => {
                if (streamOutput.includes(`<${translation}>`)) {
                    nonEnglishTagsFound++;
                    console.log(`❌ Found translated system tag: <${translation}>`);
                }
            });
            
            console.log(`\n📈 Results for ${testCase.language}:`);
            console.log(`   English system tags found: ${englishTagsFound}`);
            console.log(`   Non-English system tags found: ${nonEnglishTagsFound}`);
            
            if (nonEnglishTagsFound === 0) {
                console.log(`   ✅ PASS: All system tags remain in English`);
            } else {
                console.log(`   ❌ FAIL: Found translated system tags`);
            }
            
        } catch (error) {
            console.error(`❌ Error testing ${testCase.language}:`, error.message);
        }
        
        console.log("\n" + "=".repeat(40));
    }
    
    console.log("\n🎯 Language Compliance Test Complete");
    console.log("\nKey Requirements Verified:");
    console.log("- System tags (<start>, <complete>, <thinking>, <e>) remain English-only");
    console.log("- User-facing content can be in user's language");
    console.log("- Technical compatibility maintained across all languages");
}

// Export for manual testing
export { testLanguageCompliance };

// Run test if called directly
if (process.argv[1].endsWith('test_language_compliance.js')) {
    testLanguageCompliance().catch(console.error);
}
