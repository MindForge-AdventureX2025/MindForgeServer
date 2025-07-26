import { query, queryStream } from './query.js';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock response object for testing queryStream
class MockResponse {
    constructor() {
        this.chunks = [];
        this.events = [];
        this.ended = false;
    }

    write(data) {
        console.log('📡 Stream Data:', data);
        
        try {
            // Parse the SSE data
            if (data.startsWith('data: ')) {
                const jsonData = JSON.parse(data.substring(6));
                
                if (jsonData.chunk) {
                    this.chunks.push(jsonData.chunk);
                } else if (jsonData.status) {
                    this.events.push(jsonData);
                }
            }
        } catch (e) {
            // If not JSON, just store the raw data
            this.chunks.push(data);
        }
    }

    end() {
        this.ended = true;
        console.log('📡 Stream ended');
    }

    setHeader(name, value) {
        console.log(`📡 Header set: ${name} = ${value}`);
    }

    getFullText() {
        return this.chunks.join('');
    }

    getEvents() {
        return this.events;
    }
}

// Test function for simple query
async function testQuery(message) {
    console.log('\n🧪 Testing simple query...');
    console.log('📝 Input:', message);
    console.log('⏳ Processing...\n');

    try {
        const result = await query(message);
        console.log('✅ Query Result:');
        console.log('📄 Output:', result.output_text);
        return result;
    } catch (error) {
        console.error('❌ Query Error:', error.message);
        throw error;
    }
}

// Test function for streaming query
async function testQueryStream(message) {
    console.log('\n🧪 Testing streaming query with agent workflow...');
    console.log('📝 Input:', message);
    console.log('⏳ Processing...\n');

    const mockRes = new MockResponse();

    try {
        const result = await queryStream(message, mockRes);
        
        console.log('\n✅ Stream Query Results:');
        console.log('📄 Main Response:', result);
        console.log('\n📡 Stream Events:');
        mockRes.getEvents().forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.status}: ${event.message || event.chunk || JSON.stringify(event)}`);
        });
        
        console.log('\n📝 Full Streamed Text:');
        console.log(mockRes.getFullText());
        
        return {
            mainResponse: result,
            streamedText: mockRes.getFullText(),
            events: mockRes.getEvents()
        };
    } catch (error) {
        console.error('❌ Stream Query Error:', error.message);
        throw error;
    }
}

// Interactive test function
async function runInteractiveTest() {
    console.log('🚀 MindForge Query Test Interface');
    console.log('=====================================\n');

    // Test cases
    const testCases = [
        {
            name: "Simple Question",
            message: "What is artificial intelligence?"
        },
        {
            name: "Journal Analysis Request",
            message: "Please analyze my mood based on my recent journal entries and provide emotional support.",
            journals: [
                {
                    title: "Today's Reflection",
                    content: "I've been feeling quite overwhelmed lately with work pressures and personal challenges.",
                    tags: ["stress", "work", "personal"],
                    audioIds: []
                }
            ]
        },
        {
            name: "Complex Multi-Agent Task",
            message: "Help me organize my thoughts from recent conversations and create actionable recommendations for improving my productivity.",
            history: [
                { role: "user", content: "I've been struggling with time management" },
                { role: "llm", content: "Time management is indeed challenging. What specific areas are you finding most difficult?" },
                { role: "user", content: "Mainly prioritizing tasks and avoiding distractions" }
            ]
        }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n🎯 Test Case ${i + 1}: ${testCase.name}`);
        console.log('=' + '='.repeat(testCase.name.length + 15));

        // Prepare the message with additional context if available
        let fullMessage = testCase.message;
        
        if (testCase.journals) {
            fullMessage += "\n\nfollowing is the Journal that I would like to reference: {\n";
            testCase.journals.forEach(journal => {
                fullMessage += `\nTitle: ${journal.title}\nContent: ${journal.content}\nTags: ${journal.tags.join(", ")}\nAudio IDs: ${journal.audioIds.join(", ")}`;
            });
            fullMessage += "\n}";
        }

        if (testCase.history) {
            fullMessage += "\n\nHistory Conversation: " + JSON.stringify(testCase.history);
        }

        try {
            // Test simple query first
            // console.log('\n📋 Testing Simple Query:');
            // const simpleResult = await testQuery(fullMessage);

            // Test streaming query with agent workflow
            console.log('\n📋 Testing Streaming Query with Agent Workflow:');
            const streamResult = await testQueryStream(fullMessage);

            saveTestResults(streamResult, `test_case_${i + 1}_results.json`);

            console.log('\n✅ Test case completed successfully!\n');
            console.log('─'.repeat(60));

        } catch (error) {
            console.error(`❌ Test case ${i + 1} failed:`, error.message);
            console.log('─'.repeat(60));
        }

        // Wait a bit between tests to avoid overwhelming the API
        if (i < testCases.length - 1) {
            console.log('\n⏸️  Waiting 2 seconds before next test...\n');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Custom test function
async function runCustomTest(customMessage) {
    console.log('🎯 Custom Test');
    console.log('===============\n');

    try {
        console.log('📋 Testing Simple Query:');
        await testQuery(customMessage);

        console.log('\n📋 Testing Streaming Query with Agent Workflow:');
        await testQueryStream(customMessage);

        console.log('\n✅ Custom test completed successfully!');
    } catch (error) {
        console.error('❌ Custom test failed:', error.message);
    }
}

// Save test results to file
async function saveTestResults(results, filename) {
    const outputPath = join(__dirname, '..', 'test_results', filename);
    const writeStream = createWriteStream(outputPath);
    
    writeStream.write(JSON.stringify(results, null, 2));
    writeStream.end();
    
    console.log(`💾 Test results saved to: ${outputPath}`);
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Run interactive tests
        await runInteractiveTest();
    } else {
        // Run custom test with provided message
        const customMessage = args.join(' ');
        await runCustomTest(customMessage);
    }
}

// Export functions for programmatic use
export {
    testQuery,
    testQueryStream,
    runInteractiveTest,
    runCustomTest,
    saveTestResults,
    MockResponse
};

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}
