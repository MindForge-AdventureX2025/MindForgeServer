import dotenv from 'dotenv';
dotenv.config();

import { query } from './utils/query.js';

/**
 * DEBUG TOOL INTEGRATION
 * Simple test to see if agents are using tools
 */

async function debugToolIntegration() {
    console.log('🔍 DEBUG TOOL INTEGRATION');
    console.log('Testing if agents actually call backend tools');
    console.log('=' .repeat(50));

    try {
        // Test with explicit tool request
        const message = `Please create a memory entry about "JavaScript Promises" with the content "Understanding asynchronous programming with promises for better code flow". Use the create_memory tool to store this in the RAG database.

Make sure to:
1. Use the create_memory tool
2. Set memoryType to "topics_of_interest"
3. Set title to "JavaScript Promises"
4. Set content to the description above
5. Add tags like ["javascript", "programming", "async"]

Format your tool call exactly like this:
\`\`\`json
{"tool_call": {"tool": "create_memory", "params": {"memoryType": "topics_of_interest", "title": "JavaScript Promises", "content": "Understanding asynchronous programming with promises for better code flow", "tags": ["javascript", "programming", "async"]}}}
\`\`\``;

        console.log('📝 Explicit tool request message:');
        console.log(message);
        console.log('\n🤖 Calling query() with explicit tool request...');
        
        const result = await query(message, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('\n✅ Query completed');
        console.log('📊 Result analysis:');
        console.log(`   Type: ${typeof result}`);
        console.log(`   Has combined_response: ${!!result.combined_response}`);
        console.log(`   Has output_text: ${!!result.output_text}`);
        console.log(`   Has agent_workflow_result: ${!!result.agent_workflow_result}`);
        
        const response = result.combined_response || result.output_text || result;
        console.log(`\n📝 Full Response:`);
        console.log(String(response));
        
        // Check if response contains tool_call
        if (String(response).includes('tool_call')) {
            console.log('\n✅ SUCCESS: Response contains tool_call!');
        } else {
            console.log('\n❌ ISSUE: Response does not contain tool_call');
        }
        
        // Check if response contains memory creation confirmation
        if (String(response).toLowerCase().includes('memory') || String(response).toLowerCase().includes('created')) {
            console.log('✅ Response mentions memory creation');
        } else {
            console.log('⚠️ Response does not mention memory creation');
        }
        
    } catch (error) {
        console.error('💥 Debug test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

debugToolIntegration().then(() => {
    console.log('\n🏁 Debug tool integration completed');
}).catch(error => {
    console.error('💥 Fatal debug error:', error);
});
