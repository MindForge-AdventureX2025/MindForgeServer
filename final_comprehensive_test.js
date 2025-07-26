import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { query } from './utils/query.js';

/**
 * FINAL COMPREHENSIVE AGENT DATABASE TEST
 * Definitive test to verify if AI agents can modify databases
 */

async function finalComprehensiveTest() {
    console.log('🎯 FINAL COMPREHENSIVE AGENT DATABASE TEST');
    console.log('=' .repeat(80));
    console.log('This test will definitively determine if agents can modify databases');

    const baseURL = 'http://localhost:3000';
    const axiosInstance = axios.create({
        baseURL,
        timeout: 20000,
        headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true'
        }
    });

    const testResults = {
        memoryCreation: false,
        journalCreation: false,
        tagAddition: false,
        agentResponses: []
    };

    try {
        // Get baseline counts
        console.log('\n📊 Getting baseline database counts...');
        const initialJournals = await axiosInstance.get('/api/journals');
        const initialMemories = await axiosInstance.get('/api/rag');
        
        const baselineJournals = initialJournals.data.length;
        const baselineMemories = initialMemories.data.length;
        
        console.log(`📔 Baseline journals: ${baselineJournals}`);
        console.log(`🧠 Baseline memories: ${baselineMemories}`);

        // Test 1: Explicit Memory Creation Request
        console.log('\n🧠 TEST 1: Explicit Memory Creation');
        console.log('─'.repeat(50));
        
        const memoryRequest = `URGENT: I need you to create a memory entry in my database right now. 

Title: "Time Management Breakthrough"
Content: "Discovered that time-blocking in 25-minute Pomodoro sessions dramatically improves my focus and productivity. This technique helps me avoid distractions and complete tasks more efficiently."
Memory Type: behavioral_patterns
Tags: ["productivity", "time-management", "focus"]

Please use the create_memory tool to save this information to my RAG database immediately. Do not just acknowledge - actually execute the tool call to create the memory entry.`;

        console.log(`📝 Memory request: "${memoryRequest}"`);
        console.log('🤖 Calling agents for memory creation...');
        
        const memoryResult = await query(memoryRequest, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        const memoryResponse = String(memoryResult.combined_response || memoryResult.output_text || memoryResult);
        testResults.agentResponses.push({
            test: 'Memory Creation',
            response: memoryResponse
        });
        
        console.log('✅ Agents responded to memory request');
        console.log(`📝 Response length: ${memoryResponse.length} characters`);
        
        // Check if memory was created
        console.log('🔍 Checking if memory was created...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for async operations
        
        const postMemoryCheck = await axiosInstance.get('/api/rag');
        const newMemoryCount = postMemoryCheck.data.length;
        
        console.log(`📊 Memory count after request: ${newMemoryCount}`);
        
        if (newMemoryCount > baselineMemories) {
            testResults.memoryCreation = true;
            console.log('🎉 SUCCESS: Memory was created in database!');
            const newMemory = postMemoryCheck.data[0];
            console.log(`   📚 Created: "${newMemory.title}" (Type: ${newMemory.memoryType})`);
        } else {
            console.log('❌ FAILED: No memory was created in database');
        }

        // Test 2: Explicit Journal Creation Request
        console.log('\n📔 TEST 2: Explicit Journal Creation');
        console.log('─'.repeat(50));
        
        const journalRequest = `URGENT: I need you to create a journal entry in my database right now.

Title: "Daily Reflection - Success Patterns"
Content: "Today I identified key patterns in my most productive days: starting with exercise, having a structured morning routine, and taking regular breaks. These elements consistently lead to better focus and higher achievement. I want to document this insight to build on it."

Please use the create_journal tool to save this journal entry to my database immediately. Do not just acknowledge - actually execute the tool call to create the journal.`;

        console.log(`📝 Journal request: "${journalRequest}"`);
        console.log('🤖 Calling agents for journal creation...');
        
        const journalResult = await query(journalRequest, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        const journalResponse = String(journalResult.combined_response || journalResult.output_text || journalResult);
        testResults.agentResponses.push({
            test: 'Journal Creation',
            response: journalResponse
        });
        
        console.log('✅ Agents responded to journal request');
        console.log(`📝 Response length: ${journalResponse.length} characters`);
        
        // Check if journal was created
        console.log('🔍 Checking if journal was created...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for async operations
        
        const postJournalCheck = await axiosInstance.get('/api/journals');
        const newJournalCount = postJournalCheck.data.length;
        
        console.log(`📊 Journal count after request: ${newJournalCount}`);
        
        if (newJournalCount > baselineJournals) {
            testResults.journalCreation = true;
            console.log('🎉 SUCCESS: Journal was created in database!');
            const newJournal = postJournalCheck.data[0];
            console.log(`   📔 Created: "${newJournal.title}"`);
        } else {
            console.log('❌ FAILED: No journal was created in database');
        }

        // Test 3: Create a test journal and request tag addition
        console.log('\n🏷️ TEST 3: Explicit Tag Addition');
        console.log('─'.repeat(50));
        
        // Create a test journal
        const testJournalResponse = await axiosInstance.post('/api/journals', {
            title: 'Cooking Experiment Results',
            content: 'Tried making homemade pasta today. The recipe was complex but the results were amazing. Learned about proper kneading techniques and the importance of resting the dough. Planning to try different sauce combinations next time.',
            tags: []
        });
        
        const testJournalId = testJournalResponse.data._id;
        console.log(`📔 Created test journal: ${testJournalId}`);
        console.log(`📊 Initial tags: ${testJournalResponse.data.tags.length}`);
        
        const tagRequest = `URGENT: I need you to add tags to a specific journal in my database right now.

Journal ID: ${testJournalId}
Content: "Tried making homemade pasta today. The recipe was complex but the results were amazing. Learned about proper kneading techniques and the importance of resting the dough. Planning to try different sauce combinations next time."

Please analyze this journal content and use the add_tags tool to add relevant tags like: ["cooking", "pasta", "recipe", "learning", "food", "skills"]

Use the add_tags tool with the exact journal ID provided. Do not just suggest tags - actually execute the tool call to add them to the database.`;

        console.log(`📝 Tag request for journal ${testJournalId}`);
        console.log('🤖 Calling agents for tag addition...');
        
        const tagResult = await query(tagRequest, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        const tagResponse = String(tagResult.combined_response || tagResult.output_text || tagResult);
        testResults.agentResponses.push({
            test: 'Tag Addition',
            response: tagResponse
        });
        
        console.log('✅ Agents responded to tag request');
        console.log(`📝 Response length: ${tagResponse.length} characters`);
        
        // Check if tags were added
        console.log('🔍 Checking if tags were added...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for async operations
        
        const updatedJournal = await axiosInstance.get(`/api/journals/${testJournalId}`);
        const finalTags = updatedJournal.data.tags;
        
        console.log(`📊 Tags after request: ${finalTags.length}`);
        console.log(`🏷️ Tags: [${finalTags.join(', ')}]`);
        
        if (finalTags.length > 0) {
            testResults.tagAddition = true;
            console.log('🎉 SUCCESS: Tags were added to journal!');
        } else {
            console.log('❌ FAILED: No tags were added to journal');
        }

        // Final Analysis
        console.log('\n📊 FINAL COMPREHENSIVE TEST RESULTS');
        console.log('=' .repeat(80));
        
        console.log(`🧠 Memory Creation: ${testResults.memoryCreation ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`📔 Journal Creation: ${testResults.journalCreation ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`🏷️ Tag Addition: ${testResults.tagAddition ? '✅ SUCCESS' : '❌ FAILED'}`);
        
        const overallSuccess = testResults.memoryCreation || testResults.journalCreation || testResults.tagAddition;
        
        console.log(`\n🏆 OVERALL DATABASE MODIFICATION: ${overallSuccess ? '✅ AGENTS CAN MODIFY DATABASE' : '❌ AGENTS CANNOT MODIFY DATABASE'}`);
        
        // Show sample responses
        console.log('\n📝 SAMPLE AGENT RESPONSES:');
        testResults.agentResponses.forEach((entry, index) => {
            console.log(`\n${index + 1}. ${entry.test}:`);
            console.log(`   "${entry.response.substring(0, 150)}..."`);
            
            if (entry.response.includes('tool_call')) {
                console.log('   ✅ Contains tool_call');
            } else {
                console.log('   ❌ No tool_call found');
            }
        });
        
        // Cleanup test journal
        try {
            await axiosInstance.delete(`/api/journals/delete/${testJournalId}`);
            console.log(`\n🧹 Cleaned up test journal: ${testJournalId}`);
        } catch (cleanupError) {
            console.log(`\n⚠️ Cleanup warning: ${cleanupError.message}`);
        }
        
        return {
            success: overallSuccess,
            results: testResults
        };
        
    } catch (error) {
        console.error('💥 Final comprehensive test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the final test
finalComprehensiveTest().then(result => {
    console.log('\n' + '=' .repeat(80));
    if (result.success) {
        console.log('🎉 FINAL COMPREHENSIVE TEST: PASSED');
        console.log('✅ AI agents can successfully modify journal and RAG databases');
    } else {
        console.log('❌ FINAL COMPREHENSIVE TEST: FAILED');
        console.log('⚠️ AI agents are not properly modifying databases');
        if (result.error) {
            console.log(`💥 Error: ${result.error}`);
        }
    }
    
    console.log('\n🔍 CONCLUSION:');
    if (result.success) {
        console.log('Your AI agents are working correctly and can make changes to the database.');
        console.log('The system is functioning as intended.');
    } else {
        console.log('Your AI agents are receiving messages and responding, but they are not');
        console.log('using the backend tools to actually modify the journal and RAG databases.');
        console.log('This indicates the agents need stronger tool usage instructions or fixes.');
    }
}).catch(error => {
    console.error('💥 Fatal final test error:', error);
});
