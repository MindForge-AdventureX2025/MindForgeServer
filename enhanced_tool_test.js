import dotenv from 'dotenv';
dotenv.config();

import { query } from './utils/query.js';

/**
 * ENHANCED TOOL INSTRUCTION TEST
 * Test if the enhanced tool instructions make agents use tools
 */

async function testEnhancedToolInstructions() {
    console.log('🔧 ENHANCED TOOL INSTRUCTION TEST');
    console.log('Testing if enhanced instructions make agents use tools');
    console.log('=' .repeat(60));

    try {
        // Test 1: Memory agent with explicit memory creation request
        console.log('\n🧠 TEST 1: Memory Agent Tool Usage');
        console.log('─'.repeat(40));
        
        const memoryMessage = `I just learned a valuable lesson about time management: "Breaking large tasks into smaller 5-minute chunks makes them less overwhelming and easier to start." This is an important behavioral insight I want to remember for my productivity journey.`;
        
        console.log(`📝 Memory message: "${memoryMessage}"`);
        console.log('🤖 Calling memory agent...');
        
        const memoryResult = await query(memoryMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('✅ Memory agent responded');
        const memoryResponse = String(memoryResult.combined_response || memoryResult.output_text || memoryResult);
        console.log(`📝 Response: "${memoryResponse}"`);
        
        // Check for tool call
        if (memoryResponse.includes('tool_call') && memoryResponse.includes('create_memory')) {
            console.log('🎉 SUCCESS: Memory agent used create_memory tool!');
        } else {
            console.log('❌ FAILED: Memory agent did not use create_memory tool');
        }

        // Test 2: Tags agent with explicit tagging request
        console.log('\n🏷️ TEST 2: Tags Agent Tool Usage');
        console.log('─'.repeat(40));
        
        // First check if there are journals available
        console.log('📊 Looking for available journals...');
        const journalCheckMessage = `Please search my journals to find one that needs tags added. Use the search_journals tool to find a journal entry.`;
        
        console.log(`📝 Journal search message: "${journalCheckMessage}"`);
        console.log('🤖 Calling tags agent for journal search...');
        
        const tagsResult = await query(journalCheckMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('✅ Tags agent responded');
        const tagsResponse = String(tagsResult.combined_response || tagsResult.output_text || tagsResult);
        console.log(`📝 Response: "${tagsResponse}"`);
        
        // Check for tool call
        if (tagsResponse.includes('tool_call') && (tagsResponse.includes('search_journals') || tagsResponse.includes('add_tags'))) {
            console.log('🎉 SUCCESS: Tags agent used journal tools!');
        } else {
            console.log('❌ FAILED: Tags agent did not use journal tools');
        }

        // Test 3: Supervisor agent with creation request
        console.log('\n👑 TEST 3: Supervisor Agent Tool Usage');
        console.log('─'.repeat(40));
        
        const supervisorMessage = `I want to create a journal entry about my morning routine optimization. Please create a journal titled "Morning Routine Insights" with content about waking up early, exercise, and meditation habits.`;
        
        console.log(`📝 Supervisor message: "${supervisorMessage}"`);
        console.log('🤖 Calling supervisor agent...');
        
        const supervisorResult = await query(supervisorMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('✅ Supervisor agent responded');
        const supervisorResponse = String(supervisorResult.combined_response || supervisorResult.output_text || supervisorResult);
        console.log(`📝 Response: "${supervisorResponse}"`);
        
        // Check for tool call
        if (supervisorResponse.includes('tool_call') && supervisorResponse.includes('create_journal')) {
            console.log('🎉 SUCCESS: Supervisor agent used create_journal tool!');
        } else {
            console.log('❌ FAILED: Supervisor agent did not use create_journal tool');
        }

        // Generate summary
        console.log('\n📊 ENHANCED TOOL INSTRUCTION TEST SUMMARY');
        console.log('=' .repeat(60));
        
        const memoryToolUsed = memoryResponse.includes('tool_call') && memoryResponse.includes('create_memory');
        const tagsToolUsed = tagsResponse.includes('tool_call') && (tagsResponse.includes('search_journals') || tagsResponse.includes('add_tags'));
        const supervisorToolUsed = supervisorResponse.includes('tool_call') && supervisorResponse.includes('create_journal');
        
        console.log(`🧠 Memory Agent Tool Usage: ${memoryToolUsed ? '✅ YES' : '❌ NO'}`);
        console.log(`🏷️ Tags Agent Tool Usage: ${tagsToolUsed ? '✅ YES' : '❌ NO'}`);
        console.log(`👑 Supervisor Agent Tool Usage: ${supervisorToolUsed ? '✅ YES' : '❌ NO'}`);
        
        const overallSuccess = memoryToolUsed || tagsToolUsed || supervisorToolUsed;
        
        console.log(`\n🏆 OVERALL RESULT: ${overallSuccess ? '✅ AGENTS ARE USING TOOLS' : '❌ AGENTS NOT USING TOOLS'}`);
        
        if (overallSuccess) {
            console.log('🎉 Enhanced tool instructions are working!');
        } else {
            console.log('⚠️ Need further investigation into tool usage patterns');
        }
        
        return overallSuccess;
        
    } catch (error) {
        console.error('💥 Enhanced tool test failed:', error.message);
        return false;
    }
}

// Run the test
testEnhancedToolInstructions().then(success => {
    if (success) {
        console.log('\n🎉 ENHANCED TOOL INSTRUCTION TEST: PASSED');
    } else {
        console.log('\n❌ ENHANCED TOOL INSTRUCTION TEST: FAILED');
    }
}).catch(error => {
    console.error('💥 Fatal test error:', error);
});
