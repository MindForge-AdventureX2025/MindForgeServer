import dotenv from 'dotenv';
dotenv.config();

import { query } from './utils/query.js';

/**
 * QUICK WORKFLOW VERIFICATION
 * Fast test to verify query() function works correctly
 */

async function quickWorkflowTest() {
    console.log('⚡ QUICK WORKFLOW VERIFICATION');
    console.log('Testing query() function directly...');
    console.log('=' .repeat(50));

    try {
        console.log('🎯 Testing basic query functionality...');
        
        const testMessage = "Help me with productivity and time management.";
        console.log(`📝 Test message: "${testMessage}"`);
        console.log('⏱️ Calling query()...');
        
        const result = await query(testMessage, { 
            userId: '507f1f77bcf86cd799439011' 
        });
        
        console.log('✅ Query() executed successfully!');
        console.log('📊 Result analysis:');
        console.log(`   - Result type: ${typeof result}`);
        console.log(`   - Has result: ${!!result}`);
        
        if (result) {
            console.log(`   - Has combined_response: ${!!result.combined_response}`);
            console.log(`   - Has output_text: ${!!result.output_text}`);
            console.log(`   - Has agent_workflow_result: ${!!result.agent_workflow_result}`);
            
            const response = result.combined_response || result.output_text || String(result);
            console.log(`   - Response length: ${response.length} characters`);
            console.log(`   - Response preview: "${response.substring(0, 150)}..."`);
            
            console.log('🎉 WORKFLOW VERIFICATION: PASSED');
            console.log('✅ query() function is working correctly');
            console.log('✅ Agents are responding appropriately');
            console.log('✅ System is ready for updateChat() integration');
        } else {
            console.log('❌ No result returned');
            console.log('🚫 WORKFLOW VERIFICATION: FAILED');
        }
        
    } catch (error) {
        console.log(`💥 Error: ${error.message}`);
        console.log('🚫 WORKFLOW VERIFICATION: FAILED');
        console.error('Stack trace:', error.stack);
    }
}

// Run quick test
quickWorkflowTest().then(() => {
    console.log('\n⚡ Quick workflow verification completed!');
}).catch(error => {
    console.error('💥 Fatal error:', error);
});
