import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { query } from './utils/query.js';

/**
 * TARGETED AGENT BEHAVIOR TEST
 * Test specific improvements: tags addition, retrieval search, concise responses
 */

async function testAgentBehaviorImprovements() {
    console.log('🎯 TARGETED AGENT BEHAVIOR TEST');
    console.log('Testing: Tags addition, Active retrieval, Concise responses');
    console.log('=' .repeat(70));

    const baseURL = 'http://localhost:3000';
    const axiosInstance = axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true'
        }
    });

    const testResults = {
        tagsActuallyAdded: false,
        retrievalSearchExecuted: false,
        responsesAreConcise: true,
        responses: []
    };

    try {
        // Test 1: Tags Agent Must Add Tags (Not Suggest)
        console.log('\n🏷️ TEST 1: Tags Agent Must Add Tags');
        console.log('─'.repeat(50));
        
        // Create a test journal first
        const testJournal = await axiosInstance.post('/api/journals', {
            title: 'Machine Learning Project',
            content: 'Working on a neural network project using Python and TensorFlow. Learning about deep learning algorithms, backpropagation, and gradient descent. The mathematics behind it is fascinating.',
            tags: []
        });
        
        const journalId = testJournal.data._id;
        console.log(`📔 Created test journal: ${journalId}`);
        console.log(`📊 Initial tags: ${testJournal.data.tags.length}`);
        
        const tagsMessage = `Add relevant tags to this journal (ID: ${journalId}). Content: "Working on a neural network project using Python and TensorFlow. Learning about deep learning algorithms, backpropagation, and gradient descent."`;
        
        console.log(`📝 Tags request: "${tagsMessage}"`);
        console.log('🤖 Calling tags agent...');
        
        const tagsResult = await query(tagsMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        const tagsResponse = String(tagsResult.combined_response || tagsResult.output_text || tagsResult);
        testResults.responses.push({
            agent: 'tags',
            response: tagsResponse,
            wordCount: tagsResponse.split(' ').length
        });
        
        console.log('✅ Tags agent responded');
        console.log(`📝 Response: "${tagsResponse}"`);
        console.log(`📊 Word count: ${tagsResponse.split(' ').length}`);
        
        // Check if tags were actually added
        await new Promise(resolve => setTimeout(resolve, 2000));
        const updatedJournal = await axiosInstance.get(`/api/journals/${journalId}`);
        
        console.log(`📊 Tags after request: ${updatedJournal.data.tags.length}`);
        console.log(`🏷️ Tags: [${updatedJournal.data.tags.join(', ')}]`);
        
        if (updatedJournal.data.tags.length > 0) {
            testResults.tagsActuallyAdded = true;
            console.log('🎉 SUCCESS: Tags agent actually added tags!');
        } else {
            console.log('❌ FAILED: Tags agent did not add tags');
        }

        // Test 2: Retrieval Agent Must Search Databases
        console.log('\n🔍 TEST 2: Retrieval Agent Must Search Databases');
        console.log('─'.repeat(50));
        
        // First create some searchable content
        const memoryData = await axiosInstance.post('/api/rag', {
            memoryType: 'topics_of_interest',
            title: 'React State Management',
            content: 'Learning about useState, useEffect, and Context API for managing component state in React applications',
            tags: ['react', 'javascript', 'frontend']
        });
        
        console.log(`🧠 Created searchable memory: ${memoryData.data._id}`);
        
        const searchMessage = `Find information about React in my knowledge base. Search my memories and journals for any React-related content.`;
        
        console.log(`📝 Search request: "${searchMessage}"`);
        console.log('🤖 Calling retrieval agent...');
        
        const searchResult = await query(searchMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        const searchResponse = String(searchResult.combined_response || searchResult.output_text || searchResult);
        testResults.responses.push({
            agent: 'retrieval',
            response: searchResponse,
            wordCount: searchResponse.split(' ').length
        });
        
        console.log('✅ Retrieval agent responded');
        console.log(`📝 Response: "${searchResponse}"`);
        console.log(`📊 Word count: ${searchResponse.split(' ').length}`);
        
        // Check if response contains specific database results
        if (searchResponse.toLowerCase().includes('react') && 
            (searchResponse.toLowerCase().includes('found') || searchResponse.toLowerCase().includes('memory'))) {
            testResults.retrievalSearchExecuted = true;
            console.log('🎉 SUCCESS: Retrieval agent found specific content!');
        } else {
            console.log('❌ FAILED: Retrieval agent did not provide specific search results');
        }

        // Test 3: Memory Agent Concise Response
        console.log('\n🧠 TEST 3: Memory Agent Concise Response');
        console.log('─'.repeat(50));
        
        const memoryMessage = `Save this productivity insight: "Time-boxing tasks in 90-minute focused sessions with 20-minute breaks significantly improves my concentration and output quality."`;
        
        console.log(`📝 Memory request: "${memoryMessage}"`);
        console.log('🤖 Calling memory agent...');
        
        const memoryResult = await query(memoryMessage, {
            userId: '507f1f77bcf86cd799439011',
            authToken: 'test-auth-token'
        });
        
        const memoryResponse = String(memoryResult.combined_response || memoryResult.output_text || memoryResult);
        testResults.responses.push({
            agent: 'memory',
            response: memoryResponse,
            wordCount: memoryResponse.split(' ').length
        });
        
        console.log('✅ Memory agent responded');
        console.log(`📝 Response: "${memoryResponse}"`);
        console.log(`📊 Word count: ${memoryResponse.split(' ').length}`);

        // Analyze response lengths
        console.log('\n📏 RESPONSE LENGTH ANALYSIS');
        console.log('─'.repeat(50));
        
        let totalWordCount = 0;
        let responsesOver50Words = 0;
        
        testResults.responses.forEach((entry, index) => {
            const wordCount = entry.wordCount;
            totalWordCount += wordCount;
            
            console.log(`${index + 1}. ${entry.agent.toUpperCase()} Agent: ${wordCount} words ${wordCount > 50 ? '❌ TOO LONG' : '✅ GOOD'}`);
            
            if (wordCount > 50) {
                responsesOver50Words++;
                testResults.responsesAreConcise = false;
            }
        });
        
        const averageWordCount = Math.round(totalWordCount / testResults.responses.length);
        console.log(`📊 Average response length: ${averageWordCount} words`);
        console.log(`📊 Responses over 50 words: ${responsesOver50Words}/${testResults.responses.length}`);

        // Final Results
        console.log('\n🎯 TARGETED TEST RESULTS');
        console.log('=' .repeat(70));
        
        console.log(`🏷️ Tags Actually Added: ${testResults.tagsActuallyAdded ? '✅ YES' : '❌ NO'}`);
        console.log(`🔍 Retrieval Search Executed: ${testResults.retrievalSearchExecuted ? '✅ YES' : '❌ NO'}`);
        console.log(`📏 Responses Are Concise: ${testResults.responsesAreConcise ? '✅ YES' : '❌ NO'}`);
        
        const behaviorScore = (testResults.tagsActuallyAdded ? 1 : 0) + 
                            (testResults.retrievalSearchExecuted ? 1 : 0) + 
                            (testResults.responsesAreConcise ? 1 : 0);
        
        console.log(`\n🏆 BEHAVIOR IMPROVEMENT SCORE: ${behaviorScore}/3`);
        
        if (behaviorScore === 3) {
            console.log('🎉 PERFECT: All agent behavior improvements working!');
        } else if (behaviorScore >= 2) {
            console.log('✅ GOOD: Most improvements working, minor issues to address');
        } else {
            console.log('⚠️ NEEDS WORK: Significant behavior improvements needed');
        }

        // Detailed Analysis
        console.log('\n🔍 DETAILED ANALYSIS:');
        if (!testResults.tagsActuallyAdded) {
            console.log('❌ Tags agent is not adding tags - still suggesting instead of executing');
        }
        if (!testResults.retrievalSearchExecuted) {
            console.log('❌ Retrieval agent is not actively searching - providing generic responses');
        }
        if (!testResults.responsesAreConcise) {
            console.log('❌ Agent responses are too long - need better length control');
        }
        
        // Cleanup
        console.log('\n🧹 Cleaning up test resources...');
        try {
            await axiosInstance.delete(`/api/journals/delete/${journalId}`);
            await axiosInstance.delete(`/api/rag/${memoryData.data._id}`);
            console.log('✅ Cleanup completed');
        } catch (cleanupError) {
            console.log('⚠️ Cleanup warning:', cleanupError.message);
        }
        
        return behaviorScore >= 2; // Consider success if at least 2/3 improvements work
        
    } catch (error) {
        console.error('💥 Targeted test failed:', error.message);
        return false;
    }
}

// Run the targeted test
testAgentBehaviorImprovements().then(success => {
    console.log('\n' + '=' .repeat(70));
    if (success) {
        console.log('🎉 TARGETED BEHAVIOR TEST: PASSED');
        console.log('✅ Agent behavior improvements are working');
    } else {
        console.log('❌ TARGETED BEHAVIOR TEST: FAILED');
        console.log('⚠️ Agent behavior needs further improvement');
    }
}).catch(error => {
    console.error('💥 Fatal behavior test error:', error);
});
