import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { query } from './utils/query.js';

/**
 * SIMPLE AGENT DATABASE MODIFICATION TEST
 * Direct test to verify agents can modify journal and RAG databases
 */

async function testAgentDatabaseModification() {
    console.log('🎯 SIMPLE AGENT DATABASE MODIFICATION TEST');
    console.log('=' .repeat(60));

    const baseURL = 'http://localhost:3000';
    const axiosInstance = axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true'
        }
    });

    try {
        // Check initial state
        console.log('\n📊 Checking initial database state...');
        const journalsBefore = await axiosInstance.get('/api/journals');
        const memoriesBefore = await axiosInstance.get('/api/rag');
        
        console.log(`📔 Initial journals: ${journalsBefore.data.length}`);
        console.log(`🧠 Initial memories: ${memoriesBefore.data.length}`);

        // Test 1: Ask agent to create a journal
        console.log('\n📝 TEST 1: Request journal creation via agent');
        console.log('─'.repeat(40));
        
        const journalMessage = `I want to document my coding journey today. Please create a journal entry titled "Daily Coding Progress" with content about learning React hooks and implementing a todo app. Make this a proper journal entry in my system.`;
        
        console.log(`📨 Message: "${journalMessage}"`);
        console.log('🤖 Sending to agent...');
        
        const journalResult = await query(journalMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('✅ Agent responded');
        const journalResponse = String(journalResult.combined_response || journalResult.output_text || journalResult);
        console.log(`📝 Response (first 200 chars): "${journalResponse.substring(0, 200)}..."`);
        
        // Check if journal was created
        await new Promise(resolve => setTimeout(resolve, 2000));
        const journalsAfter1 = await axiosInstance.get('/api/journals');
        
        console.log(`📊 Journals after request: ${journalsAfter1.data.length}`);
        if (journalsAfter1.data.length > journalsBefore.data.length) {
            console.log('🎉 SUCCESS: Agent created journal in database!');
            const newJournal = journalsAfter1.data[0];
            console.log(`   📔 Created: "${newJournal.title}"`);
        } else {
            console.log('❌ FAILED: No new journal created');
        }

        // Test 2: Ask agent to create memory
        console.log('\n🧠 TEST 2: Request memory creation via agent');
        console.log('─'.repeat(40));
        
        const memoryMessage = `I just learned something important about JavaScript async/await that I want to remember. Please save this knowledge: "Async/await makes asynchronous code more readable by allowing us to write it in a synchronous style. Always remember to handle errors with try/catch." Store this as a programming memory in my knowledge base.`;
        
        console.log(`📨 Message: "${memoryMessage}"`);
        console.log('🤖 Sending to agent...');
        
        const memoryResult = await query(memoryMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('✅ Agent responded');
        const memoryResponse = String(memoryResult.combined_response || memoryResult.output_text || memoryResult);
        console.log(`📝 Response (first 200 chars): "${memoryResponse.substring(0, 200)}..."`);
        
        // Check if memory was created
        await new Promise(resolve => setTimeout(resolve, 2000));
        const memoriesAfter1 = await axiosInstance.get('/api/rag');
        
        console.log(`📊 Memories after request: ${memoriesAfter1.data.length}`);
        if (memoriesAfter1.data.length > memoriesBefore.data.length) {
            console.log('🎉 SUCCESS: Agent created memory in database!');
            const newMemory = memoriesAfter1.data[0];
            console.log(`   🧠 Created: "${newMemory.title}" (Type: ${newMemory.memoryType})`);
        } else {
            console.log('❌ FAILED: No new memory created');
        }

        // Test 3: Create a journal and ask agent to add tags
        console.log('\n🏷️ TEST 3: Request tag addition via agent');
        console.log('─'.repeat(40));
        
        // Create a test journal first
        const testJournal = await axiosInstance.post('/api/journals', {
            title: 'Nature Photography Session',
            content: 'Spent the morning taking photos of mountains, forests, and wildlife. The lighting was perfect and I captured some amazing shots of deer and eagles.',
            tags: []
        });
        
        const journalId = testJournal.data._id;
        console.log(`📔 Created test journal: ${journalId}`);
        console.log(`📊 Initial tags: ${testJournal.data.tags.length}`);
        
        const tagsMessage = `I have a journal entry about nature photography (ID: ${journalId}) that needs proper tags. Please analyze the content and add relevant tags like "photography", "nature", "wildlife", etc. Make sure to actually add the tags to the journal in the system.`;
        
        console.log(`📨 Message: "${tagsMessage}"`);
        console.log('🤖 Sending to agent...');
        
        const tagsResult = await query(tagsMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        console.log('✅ Agent responded');
        const tagsResponse = String(tagsResult.combined_response || tagsResult.output_text || tagsResult);
        console.log(`📝 Response (first 200 chars): "${tagsResponse.substring(0, 200)}..."`);
        
        // Check if tags were added
        await new Promise(resolve => setTimeout(resolve, 2000));
        const updatedJournal = await axiosInstance.get(`/api/journals/${journalId}`);
        
        console.log(`📊 Tags after request: ${updatedJournal.data.tags.length}`);
        console.log(`🏷️ Tags: [${updatedJournal.data.tags.join(', ')}]`);
        
        if (updatedJournal.data.tags.length > 0) {
            console.log('🎉 SUCCESS: Agent added tags to journal!');
        } else {
            console.log('❌ FAILED: No tags added to journal');
        }

        // Generate final report
        console.log('\n📊 FINAL TEST RESULTS');
        console.log('=' .repeat(60));
        
        const finalJournals = await axiosInstance.get('/api/journals');
        const finalMemories = await axiosInstance.get('/api/rag');
        
        const journalsCreated = finalJournals.data.length - journalsBefore.data.length;
        const memoriesCreated = finalMemories.data.length - memoriesBefore.data.length;
        const tagsAdded = updatedJournal.data.tags.length > 0;
        
        console.log(`📔 Journals created by agents: ${journalsCreated}`);
        console.log(`🧠 Memories created by agents: ${memoriesCreated}`);
        console.log(`🏷️ Tags added by agents: ${tagsAdded ? 'Yes' : 'No'}`);
        
        const overallSuccess = journalsCreated > 0 || memoriesCreated > 0 || tagsAdded;
        
        console.log(`\n🏆 OVERALL RESULT: ${overallSuccess ? '✅ AGENTS CAN MODIFY DATABASE' : '❌ AGENTS CANNOT MODIFY DATABASE'}`);
        
        if (overallSuccess) {
            console.log('🎉 AI agents are successfully using tools to modify the database!');
        } else {
            console.log('⚠️ AI agents are not using tools to modify the database - investigation needed');
        }
        
        // Cleanup
        console.log('\n🧹 Cleaning up test resources...');
        try {
            await axiosInstance.delete(`/api/journals/delete/${journalId}`);
            console.log('✅ Cleanup completed');
        } catch (cleanupError) {
            console.log('⚠️ Cleanup warning:', cleanupError.message);
        }
        
        return overallSuccess;
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run the test
testAgentDatabaseModification().then(success => {
    if (success) {
        console.log('\n🎉 AGENT DATABASE MODIFICATION TEST: PASSED');
        process.exit(0);
    } else {
        console.log('\n❌ AGENT DATABASE MODIFICATION TEST: FAILED');
        process.exit(1);
    }
}).catch(error => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});
