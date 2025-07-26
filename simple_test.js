import { query } from './utils/query.js';

async function quickTest() {
    console.log('🧪 Quick AI System Test');
    console.log('=======================');
    
    try {
        const testMessage = "I feel anxious about my presentation tomorrow. Help me calm down.";
        console.log(`📝 Testing: "${testMessage}"`);
        console.log('⏳ Processing...\n');
        
        const startTime = Date.now();
        const result = await query(testMessage, {
            userId: 'test_user_123',
            authToken: 'test_token'
        });
        const endTime = Date.now();
        
        console.log('✅ Test completed!');
        console.log(`⏱️ Response time: ${endTime - startTime}ms`);
        console.log(`📏 Response length: ${(result.combined_response || result.output_text || '').length} characters`);
        console.log(`🤖 Has agent workflow: ${!!result.agent_workflow_result}`);
        
        console.log('\n📤 Initial Response:');
        console.log('"' + (result.output_text || '').substring(0, 200) + '..."');
        
        if (result.agent_workflow_result) {
            console.log('\n🔄 Agent Workflow Result:');
            console.log('"' + result.agent_workflow_result.substring(0, 200) + '..."');
        }
        
        console.log('\n📊 Combined Response:');
        const combinedText = result.combined_response || result.output_text || '';
        console.log('"' + combinedText.substring(0, 300) + (combinedText.length > 300 ? '...' : '') + '"');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

quickTest();
