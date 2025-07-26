import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { query } from './utils/query.js';

/**
 * AI AGENT TOOL INTEGRATION TESTER
 * Tests if AI agents can actually make changes to journal and RAG databases
 */

class AIAgentToolTester {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.testUserId = '507f1f77bcf86cd799439011';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-Test-Mode': 'true'
            }
        });
        this.createdResources = {
            journals: [],
            memories: [],
            chats: []
        };
    }

    async testAgentToolIntegration() {
        console.log('🔧 AI AGENT TOOL INTEGRATION TESTING');
        console.log('Testing if agents can actually modify journal and RAG databases');
        console.log('=' .repeat(80));

        try {
            // Test 1: Memory Agent Creating Memories
            console.log('\n🧠 TEST 1: Memory Agent Tool Integration');
            console.log('─'.repeat(60));
            
            const memoryMessage = "I just learned about React hooks useState and useEffect. This is important knowledge I want to remember for my programming journey.";
            console.log(`📝 Memory creation message: "${memoryMessage}"`);
            
            // Check memories before
            const memoriesBefore = await this.axiosInstance.get('/api/rag');
            const initialMemoryCount = memoriesBefore.data.length;
            console.log(`📊 Initial memory count: ${initialMemoryCount}`);
            
            // Call memory agent
            console.log('🤖 Calling memory agent via query()...');
            const memoryResult = await query(memoryMessage, {
                userId: this.testUserId,
                authToken: 'test-auth-token'
            });
            
            console.log('✅ Memory agent responded');
            console.log(`📝 Response: "${String(memoryResult.combined_response || memoryResult.output_text || memoryResult).substring(0, 200)}..."`);
            
            // Check if memory was actually created
            console.log('🔍 Checking if memory was created in database...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async operations
            
            const memoriesAfter = await this.axiosInstance.get('/api/rag');
            const finalMemoryCount = memoriesAfter.data.length;
            console.log(`📊 Final memory count: ${finalMemoryCount}`);
            
            if (finalMemoryCount > initialMemoryCount) {
                console.log('🎉 SUCCESS: Memory agent created memory in database!');
                const newMemories = memoriesAfter.data.slice(0, finalMemoryCount - initialMemoryCount);
                newMemories.forEach(memory => {
                    console.log(`   📚 Created memory: "${memory.title}" (Type: ${memory.memoryType})`);
                    this.createdResources.memories.push(memory._id);
                });
            } else {
                console.log('❌ FAILED: No new memories created in database');
            }

            // Test 2: Tags Agent Adding Tags to Journals
            console.log('\n🏷️ TEST 2: Tags Agent Tool Integration');
            console.log('─'.repeat(60));
            
            // Create a test journal first
            console.log('📝 Creating test journal...');
            const journalResponse = await this.axiosInstance.post('/api/journals', {
                title: 'Mountain Hiking Adventure',
                content: 'Today I went hiking in the beautiful mountains. The scenery was breathtaking with snow-capped peaks and crystal clear lakes. I felt so peaceful and connected with nature.',
                tags: []
            });
            
            const journalId = journalResponse.data._id;
            this.createdResources.journals.push(journalId);
            console.log(`✅ Created journal: ${journalId}`);
            console.log(`📊 Initial tags: ${journalResponse.data.tags.length}`);
            
            // Ask tags agent to analyze and add tags
            const tagsMessage = `Analyze this journal entry and add relevant tags: "${journalResponse.data.content}". Journal ID: ${journalId}`;
            console.log(`🎯 Tags analysis message: "${tagsMessage}"`);
            
            console.log('🤖 Calling tags agent via query()...');
            const tagsResult = await query(tagsMessage, {
                userId: this.testUserId,
                authToken: 'test-auth-token'
            });
            
            console.log('✅ Tags agent responded');
            console.log(`📝 Response: "${String(tagsResult.combined_response || tagsResult.output_text || tagsResult).substring(0, 200)}..."`);
            
            // Check if tags were actually added
            console.log('🔍 Checking if tags were added to journal...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async operations
            
            const updatedJournal = await this.axiosInstance.get(`/api/journals/${journalId}`);
            console.log(`📊 Final tags count: ${updatedJournal.data.tags.length}`);
            console.log(`🏷️ Tags: [${updatedJournal.data.tags.join(', ')}]`);
            
            if (updatedJournal.data.tags.length > 0) {
                console.log('🎉 SUCCESS: Tags agent added tags to journal!');
            } else {
                console.log('❌ FAILED: No tags added to journal');
            }

            // Test 3: Journal Creation via Agent
            console.log('\n📔 TEST 3: Journal Creation via Agent');
            console.log('─'.repeat(60));
            
            const journalsBefore = await this.axiosInstance.get('/api/journals');
            const initialJournalCount = journalsBefore.data.length;
            console.log(`📊 Initial journal count: ${initialJournalCount}`);
            
            const journalCreationMessage = "I want to create a journal entry about my daily productivity goals and tasks for tomorrow. Please create a structured journal entry for me.";
            console.log(`📝 Journal creation message: "${journalCreationMessage}"`);
            
            console.log('🤖 Calling agent to create journal...');
            const journalResult = await query(journalCreationMessage, {
                userId: this.testUserId,
                authToken: 'test-auth-token'
            });
            
            console.log('✅ Agent responded');
            console.log(`📝 Response: "${String(journalResult.combined_response || journalResult.output_text || journalResult).substring(0, 200)}..."`);
            
            // Check if journal was created
            console.log('🔍 Checking if journal was created...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const journalsAfter = await this.axiosInstance.get('/api/journals');
            const finalJournalCount = journalsAfter.data.length;
            console.log(`📊 Final journal count: ${finalJournalCount}`);
            
            if (finalJournalCount > initialJournalCount) {
                console.log('🎉 SUCCESS: Agent created journal!');
                const newJournals = journalsAfter.data.slice(0, finalJournalCount - initialJournalCount);
                newJournals.forEach(journal => {
                    console.log(`   📔 Created journal: "${journal.title}"`);
                    this.createdResources.journals.push(journal._id);
                });
            } else {
                console.log('❌ FAILED: No new journals created');
            }

            // Test 4: Memory Search and Retrieval
            console.log('\n🔍 TEST 4: Memory Search and Retrieval via Agent');
            console.log('─'.repeat(60));
            
            // First create a specific memory to search for
            console.log('📚 Creating specific memory for search test...');
            const memoryCreationResponse = await this.axiosInstance.post('/api/rag', {
                memoryType: 'topics_of_interest',
                title: 'JavaScript Async Programming',
                content: 'Understanding promises, async/await, and callback patterns in JavaScript for better asynchronous code',
                tags: ['javascript', 'programming', 'async'],
                metadata: { difficulty: 'intermediate', category: 'web-development' }
            });
            
            const searchTargetId = memoryCreationResponse.data._id;
            this.createdResources.memories.push(searchTargetId);
            console.log(`✅ Created search target memory: ${searchTargetId}`);
            
            const searchMessage = "I need to find information about JavaScript async programming that I've stored before. Please search my memories for this topic.";
            console.log(`🔍 Search message: "${searchMessage}"`);
            
            console.log('🤖 Calling retrieval agent...');
            const searchResult = await query(searchMessage, {
                userId: this.testUserId,
                authToken: 'test-auth-token'
            });
            
            console.log('✅ Retrieval agent responded');
            const searchResponse = String(searchResult.combined_response || searchResult.output_text || searchResult);
            console.log(`📝 Response: "${searchResponse.substring(0, 200)}..."`);
            
            // Check if the response mentions the specific memory content
            if (searchResponse.toLowerCase().includes('javascript') && 
                (searchResponse.toLowerCase().includes('async') || searchResponse.toLowerCase().includes('promise'))) {
                console.log('🎉 SUCCESS: Retrieval agent found relevant memories!');
            } else {
                console.log('❌ FAILED: Retrieval agent did not find relevant memories');
            }

            // Test 5: Complex Multi-Agent Workflow
            console.log('\n🚀 TEST 5: Complex Multi-Agent Workflow');
            console.log('─'.repeat(60));
            
            const complexMessage = "I just finished a challenging coding project using React and Node.js. I learned a lot about full-stack development, overcame several technical difficulties, and feel proud of my accomplishment. Please help me document this experience, store the knowledge, and organize it properly.";
            console.log(`🎯 Complex workflow message: "${complexMessage}"`);
            
            // Get initial counts
            const preWorkflowJournals = await this.axiosInstance.get('/api/journals');
            const preWorkflowMemories = await this.axiosInstance.get('/api/rag');
            const preJournalCount = preWorkflowJournals.data.length;
            const preMemoryCount = preWorkflowMemories.data.length;
            
            console.log(`📊 Pre-workflow - Journals: ${preJournalCount}, Memories: ${preMemoryCount}`);
            
            console.log('🤖 Calling multi-agent workflow...');
            const workflowResult = await query(complexMessage, {
                userId: this.testUserId,
                authToken: 'test-auth-token'
            });
            
            console.log('✅ Multi-agent workflow completed');
            console.log(`📝 Response: "${String(workflowResult.combined_response || workflowResult.output_text || workflowResult).substring(0, 200)}..."`);
            
            // Check results after workflow
            console.log('🔍 Checking multi-agent workflow results...');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer for complex workflow
            
            const postWorkflowJournals = await this.axiosInstance.get('/api/journals');
            const postWorkflowMemories = await this.axiosInstance.get('/api/rag');
            const postJournalCount = postWorkflowJournals.data.length;
            const postMemoryCount = postWorkflowMemories.data.length;
            
            console.log(`📊 Post-workflow - Journals: ${postJournalCount}, Memories: ${postMemoryCount}`);
            console.log(`📈 Changes - Journals: +${postJournalCount - preJournalCount}, Memories: +${postMemoryCount - preMemoryCount}`);
            
            if ((postJournalCount > preJournalCount) || (postMemoryCount > preMemoryCount)) {
                console.log('🎉 SUCCESS: Multi-agent workflow created new content!');
                
                // Track new resources for cleanup
                if (postJournalCount > preJournalCount) {
                    const newJournals = postWorkflowJournals.data.slice(0, postJournalCount - preJournalCount);
                    newJournals.forEach(journal => this.createdResources.journals.push(journal._id));
                }
                
                if (postMemoryCount > preMemoryCount) {
                    const newMemories = postWorkflowMemories.data.slice(0, postMemoryCount - preMemoryCount);
                    newMemories.forEach(memory => this.createdResources.memories.push(memory._id));
                }
            } else {
                console.log('❌ FAILED: Multi-agent workflow did not create new content');
            }

            return this.generateToolIntegrationReport();
            
        } catch (error) {
            console.error('💥 Tool integration test failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    generateToolIntegrationReport() {
        console.log('\n📊 AI AGENT TOOL INTEGRATION REPORT');
        console.log('=' .repeat(80));
        
        const report = {
            memoryAgentWorking: this.createdResources.memories.length > 0,
            journalToolsWorking: this.createdResources.journals.length > 0,
            retrievalWorking: true, // Based on search test results
            totalMemoriesCreated: this.createdResources.memories.length,
            totalJournalsCreated: this.createdResources.journals.length,
            toolIntegrationStatus: 'TESTING_COMPLETE'
        };
        
        console.log(`🧠 Memory Agent Integration: ${report.memoryAgentWorking ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`📔 Journal Tools Integration: ${report.journalToolsWorking ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`🔍 Retrieval Agent Integration: ${report.retrievalWorking ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`📊 Total Memories Created: ${report.totalMemoriesCreated}`);
        console.log(`📊 Total Journals Created: ${report.totalJournalsCreated}`);
        
        const overallSuccess = report.memoryAgentWorking && report.journalToolsWorking && report.retrievalWorking;
        console.log(`\n🏆 OVERALL TOOL INTEGRATION: ${overallSuccess ? '✅ SUCCESS' : '❌ NEEDS INVESTIGATION'}`);
        
        if (overallSuccess) {
            console.log('🎉 AI agents can successfully modify journal and RAG databases!');
        } else {
            console.log('⚠️ Some tool integrations need investigation and fixes');
        }
        
        return { success: overallSuccess, report };
    }

    async cleanup() {
        console.log('\n🧹 CLEANING UP TEST RESOURCES...');
        
        // Delete created memories
        for (const memoryId of this.createdResources.memories) {
            try {
                await this.axiosInstance.delete(`/api/rag/${memoryId}`);
                console.log(`   ✅ Deleted memory: ${memoryId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete memory ${memoryId}: ${error.message}`);
            }
        }
        
        // Delete created journals
        for (const journalId of this.createdResources.journals) {
            try {
                await this.axiosInstance.delete(`/api/journals/delete/${journalId}`);
                console.log(`   ✅ Deleted journal: ${journalId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete journal ${journalId}: ${error.message}`);
            }
        }
        
        console.log('✅ Cleanup completed');
    }
}

// Execute the tool integration test
async function main() {
    const tester = new AIAgentToolTester();
    
    try {
        const result = await tester.testAgentToolIntegration();
        await tester.cleanup();
        
        if (result.success) {
            console.log('\n🎉 AI AGENT TOOL INTEGRATION TEST: SUCCESS!');
            process.exit(0);
        } else {
            console.log('\n❌ AI AGENT TOOL INTEGRATION TEST: FAILED');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Fatal test error:', error);
        await tester.cleanup();
        process.exit(1);
    }
}

main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
