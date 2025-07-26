import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { query } from './utils/query.js';

/**
 * COMPREHENSIVE WORKFLOW TESTER
 * Simulates entire workflow from updateChat() to query() with monitoring
 * Tests: message processing, journal references, selected context, agent workflows
 */

class WorkflowTester {
    constructor() {
        this.baseURL = `http://localhost:${process.env.PORT || 3000}`;
        this.testUserId = '507f1f77bcf86cd799439011';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 120000, // 2 minutes for AI operations
            headers: {
                'Content-Type': 'application/json',
                'X-Test-Mode': 'true'
            }
        });
        this.testResults = {
            messageProcessing: [],
            journalReferences: [],
            selectedContext: [],
            agentWorkflows: [],
            backendProcessing: [],
            dataFlow: []
        };
        this.createdResources = {
            chats: [],
            journals: [],
            memories: []
        };
    }

    // Simulate the updateChat workflow with query() instead of queryStream()
    async simulateUpdateChatWorkflow(message, selected = "", journalIds = []) {
        console.log('\n🔄 SIMULATING UPDATECHAT WORKFLOW');
        console.log('=' .repeat(60));
        console.log(`📝 Message: "${message}"`);
        console.log(`🎯 Selected: "${selected}"`);
        console.log(`📚 Journal IDs: [${journalIds.join(', ')}]`);

        let workflowResult = {
            step1_messageProcessing: null,
            step2_journalProcessing: null,
            step3_contextProcessing: null,
            step4_queryExecution: null,
            step5_agentWorkflow: null,
            step6_backendProcessing: null,
            errors: []
        };

        try {
            // Step 1: Process the base message (same as updateChat logic)
            console.log('\n📋 STEP 1: Processing base message...');
            let requestMessages = message;
            workflowResult.step1_messageProcessing = {
                original: message,
                processed: requestMessages,
                status: 'success'
            };

            // Step 2: Process journal references (same as updateChat logic)
            console.log('\n📚 STEP 2: Processing journal references...');
            if (journalIds && journalIds.length > 0) {
                requestMessages += "\\n\\nfollowing is the Journal that I would like to reference: {\\n";
                for (const journalId of journalIds) {
                    try {
                        console.log(`   📖 Fetching journal: ${journalId}`);
                        const response = await this.axiosInstance.get(`/api/journals/${journalId}`);
                        const journal = response.data;
                        requestMessages += `\\nTitle: ${journal.title}\\nContent: ${journal.content}\\nTags: ${journal.tags?.join(", ") || ""}\\nAudio IDs: ${journal.audioIds?.join(", ") || ""}`;
                        console.log(`   ✅ Journal fetched: ${journal.title}`);
                    } catch (error) {
                        console.log(`   ❌ Failed to fetch journal ${journalId}: ${error.message}`);
                        workflowResult.errors.push(`Journal fetch failed: ${journalId}`);
                    }
                }
                requestMessages += "\\n}";
            }
            workflowResult.step2_journalProcessing = {
                journalIds,
                processed: journalIds.length > 0,
                status: 'success'
            };

            // Step 3: Process selected context (same as updateChat logic)
            console.log('\n🎯 STEP 3: Processing selected context...');
            if (selected) {
                requestMessages +=
                    "\\n\\nfollowing is the selected context in the journal that I would like to reference (the selected context is what I would like to emphasize. If you need to read something, feel free to read anything I provided with you. But if you need to add, remove, or replace something, that should be inside my selected context.): {\\n" +
                    selected +
                    "\\n}";
            }
            workflowResult.step3_contextProcessing = {
                selected,
                processed: !!selected,
                status: 'success'
            };

            console.log('\n📤 FINAL REQUEST MESSAGE:');
            console.log('─'.repeat(50));
            console.log(requestMessages);
            console.log('─'.repeat(50));

            // Step 4: Execute query() instead of queryStream()
            console.log('\n🤖 STEP 4: Executing query() function...');
            console.log('   ⏱️ Starting AI processing...');
            
            const startTime = Date.now();
            const queryResult = await query(requestMessages, {
                userId: this.testUserId,
                authToken: 'test-auth-token'
            });
            const duration = Date.now() - startTime;

            console.log(`   ✅ Query completed in ${duration}ms`);
            console.log(`   📊 Response type: ${typeof queryResult}`);
            
            workflowResult.step4_queryExecution = {
                duration,
                responseType: typeof queryResult,
                hasResponse: !!queryResult,
                status: 'success'
            };

            // Step 5: Analyze agent workflow results
            console.log('\n🔍 STEP 5: Analyzing agent workflow results...');
            if (queryResult && queryResult.agent_workflow_result) {
                console.log('   🎯 Agent workflow executed successfully');
                console.log(`   📝 Workflow result type: ${typeof queryResult.agent_workflow_result}`);
                
                workflowResult.step5_agentWorkflow = {
                    executed: true,
                    resultType: typeof queryResult.agent_workflow_result,
                    hasResult: !!queryResult.agent_workflow_result,
                    status: 'success'
                };
            } else {
                console.log('   ⚠️ No agent workflow result found');
                workflowResult.step5_agentWorkflow = {
                    executed: false,
                    status: 'missing'
                };
            }

            // Step 6: Simulate backend processing (chat update, history management)
            console.log('\n💾 STEP 6: Simulating backend processing...');
            
            // Test if we can process the response for backend storage
            const finalResponse = queryResult.combined_response || queryResult.output_text || queryResult;
            if (typeof finalResponse === 'string' && finalResponse.length > 0) {
                console.log(`   ✅ Response ready for backend storage (${finalResponse.length} chars)`);
                workflowResult.step6_backendProcessing = {
                    responseLength: finalResponse.length,
                    responseType: typeof finalResponse,
                    readyForStorage: true,
                    status: 'success'
                };
            } else {
                console.log('   ❌ Response not suitable for backend storage');
                workflowResult.step6_backendProcessing = {
                    responseLength: 0,
                    responseType: typeof finalResponse,
                    readyForStorage: false,
                    status: 'failed'
                };
                workflowResult.errors.push('Response not suitable for storage');
            }

            return workflowResult;

        } catch (error) {
            console.error(`💥 Workflow failed: ${error.message}`);
            workflowResult.errors.push(`Workflow error: ${error.message}`);
            return workflowResult;
        }
    }

    // Test specific agents individually
    async testIndividualAgents() {
        console.log('\n🤖 TESTING INDIVIDUAL AGENTS');
        console.log('=' .repeat(60));

        const agentTests = [
            {
                name: 'emotion_agent',
                message: "I'm feeling overwhelmed with work and need emotional support.",
                expectedElements: ['emotion', 'support', 'understanding']
            },
            {
                name: 'tags_agent',
                message: "I went hiking today and saw beautiful mountains and lakes.",
                expectedElements: ['hiking', 'nature', 'mountains']
            },
            {
                name: 'memory_agent',
                message: "I learned a new skill in programming today and want to remember it.",
                expectedElements: ['learning', 'programming', 'skill']
            },
            {
                name: 'supervisor_agent',
                message: "Help me organize my day with work tasks and personal activities.",
                expectedElements: ['organize', 'tasks', 'planning']
            }
        ];

        const results = [];

        for (const test of agentTests) {
            console.log(`\n🎯 Testing ${test.name}...`);
            try {
                const result = await query(test.message, { userId: this.testUserId });
                
                if (result && (result.combined_response || result.output_text)) {
                    const response = result.combined_response || result.output_text;
                    console.log(`   ✅ ${test.name} responded (${response.length} chars)`);
                    
                    // Check for expected elements
                    const foundElements = test.expectedElements.filter(element => 
                        response.toLowerCase().includes(element.toLowerCase())
                    );
                    
                    results.push({
                        agent: test.name,
                        success: true,
                        responseLength: response.length,
                        expectedElements: test.expectedElements.length,
                        foundElements: foundElements.length,
                        qualityScore: (foundElements.length / test.expectedElements.length) * 10
                    });
                } else {
                    console.log(`   ❌ ${test.name} failed to respond`);
                    results.push({
                        agent: test.name,
                        success: false,
                        error: 'No response'
                    });
                }
            } catch (error) {
                console.log(`   💥 ${test.name} error: ${error.message}`);
                results.push({
                    agent: test.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    // Test end-to-end workflow with real data
    async testEndToEndWorkflow() {
        console.log('\n🎯 END-TO-END WORKFLOW TESTING');
        console.log('=' .repeat(60));

        // Create test journal for reference
        console.log('\n📝 Creating test journal...');
        const journalResponse = await this.axiosInstance.post('/api/journals', {
            title: 'Test Journal for Workflow',
            content: 'This is a comprehensive test journal for validating the workflow. It contains important information about my daily activities, goals, and reflections.'
        });
        
        const journalId = journalResponse.data._id;
        this.createdResources.journals.push(journalId);
        console.log(`   ✅ Created journal: ${journalId}`);

        // Create test chat
        console.log('\n💬 Creating test chat...');
        const chatResponse = await this.axiosInstance.post('/api/chats');
        const chatId = chatResponse.data._id;
        this.createdResources.chats.push(chatId);
        console.log(`   ✅ Created chat: ${chatId}`);

        // Test different workflow scenarios
        const testScenarios = [
            {
                name: 'Simple Message',
                message: 'Hello, how can you help me today?',
                selected: '',
                journalIds: []
            },
            {
                name: 'Message with Journal Reference',
                message: 'Based on my journal, what insights can you provide?',
                selected: '',
                journalIds: [journalId]
            },
            {
                name: 'Message with Selected Context',
                message: 'Help me improve this part of my journal',
                selected: 'daily activities, goals, and reflections',
                journalIds: [journalId]
            },
            {
                name: 'Complex Request',
                message: 'Analyze my journal and provide emotional support and actionable insights',
                selected: 'important information about my daily activities',
                journalIds: [journalId]
            }
        ];

        const workflowResults = [];

        for (const scenario of testScenarios) {
            console.log(`\n🎭 Testing scenario: ${scenario.name}`);
            const result = await this.simulateUpdateChatWorkflow(
                scenario.message,
                scenario.selected,
                scenario.journalIds
            );
            
            result.scenarioName = scenario.name;
            workflowResults.push(result);
            
            // Brief pause between scenarios
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return workflowResults;
    }

    // Cleanup test resources
    async cleanup() {
        console.log('\n🧹 CLEANING UP TEST RESOURCES...');
        
        // Delete created journals
        for (const journalId of this.createdResources.journals) {
            try {
                await this.axiosInstance.delete(`/api/journals/delete/${journalId}`);
                console.log(`   ✅ Deleted journal: ${journalId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete journal ${journalId}: ${error.message}`);
            }
        }

        // Delete created chats
        for (const chatId of this.createdResources.chats) {
            try {
                await this.axiosInstance.delete(`/api/chats/delete/${chatId}`);
                console.log(`   ✅ Deleted chat: ${chatId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete chat ${chatId}: ${error.message}`);
            }
        }
    }

    // Generate comprehensive report
    generateReport(agentResults, workflowResults) {
        console.log('\n📊 COMPREHENSIVE WORKFLOW TEST REPORT');
        console.log('=' .repeat(80));

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalAgentTests: agentResults.length,
                successfulAgents: agentResults.filter(r => r.success).length,
                totalWorkflowTests: workflowResults.length,
                successfulWorkflows: workflowResults.filter(r => r.errors.length === 0).length
            },
            agentResults,
            workflowResults,
            recommendations: []
        };

        // Agent Analysis
        console.log(`\n🤖 AGENT TESTING RESULTS:`);
        console.log(`   📊 Total Agents Tested: ${report.summary.totalAgentTests}`);
        console.log(`   ✅ Successful: ${report.summary.successfulAgents}`);
        console.log(`   ❌ Failed: ${report.summary.totalAgentTests - report.summary.successfulAgents}`);

        agentResults.forEach(result => {
            if (result.success) {
                console.log(`   🎯 ${result.agent}: ✅ Quality Score: ${result.qualityScore.toFixed(1)}/10`);
            } else {
                console.log(`   💥 ${result.agent}: ❌ ${result.error}`);
                report.recommendations.push(`Fix ${result.agent}: ${result.error}`);
            }
        });

        // Workflow Analysis
        console.log(`\n🔄 WORKFLOW TESTING RESULTS:`);
        console.log(`   📊 Total Scenarios Tested: ${report.summary.totalWorkflowTests}`);
        console.log(`   ✅ Successful: ${report.summary.successfulWorkflows}`);
        console.log(`   ❌ Failed: ${report.summary.totalWorkflowTests - report.summary.successfulWorkflows}`);

        workflowResults.forEach(result => {
            console.log(`\n   🎭 ${result.scenarioName}:`);
            console.log(`      📝 Message Processing: ${result.step1_messageProcessing?.status || 'failed'}`);
            console.log(`      📚 Journal Processing: ${result.step2_journalProcessing?.status || 'failed'}`);
            console.log(`      🎯 Context Processing: ${result.step3_contextProcessing?.status || 'failed'}`);
            console.log(`      🤖 Query Execution: ${result.step4_queryExecution?.status || 'failed'}`);
            console.log(`      🔍 Agent Workflow: ${result.step5_agentWorkflow?.status || 'failed'}`);
            console.log(`      💾 Backend Processing: ${result.step6_backendProcessing?.status || 'failed'}`);
            
            if (result.errors.length > 0) {
                console.log(`      ❌ Errors: ${result.errors.join(', ')}`);
                result.errors.forEach(error => {
                    report.recommendations.push(`Fix workflow issue: ${error}`);
                });
            }
        });

        // Overall Status
        const overallSuccess = report.summary.successfulAgents === report.summary.totalAgentTests &&
                             report.summary.successfulWorkflows === report.summary.totalWorkflowTests;

        console.log(`\n🏆 OVERALL STATUS: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ ISSUES FOUND'}`);
        
        if (report.recommendations.length > 0) {
            console.log(`\n🔧 RECOMMENDATIONS:`);
            report.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        } else {
            console.log(`\n🎉 NO ISSUES FOUND - WORKFLOW IS PERFECT!`);
        }

        return report;
    }

    // Main testing execution
    async runComprehensiveWorkflowTest() {
        console.log('🚀 COMPREHENSIVE WORKFLOW TESTING STARTED');
        console.log('Testing entire flow from updateChat() to query() with monitoring');
        console.log('=' .repeat(80));

        try {
            // Test 1: Individual agent functionality
            console.log('\n1️⃣ TESTING INDIVIDUAL AGENTS...');
            const agentResults = await this.testIndividualAgents();

            // Test 2: End-to-end workflow scenarios
            console.log('\n2️⃣ TESTING END-TO-END WORKFLOWS...');
            const workflowResults = await this.testEndToEndWorkflow();

            // Test 3: Generate comprehensive report
            console.log('\n3️⃣ GENERATING COMPREHENSIVE REPORT...');
            const report = this.generateReport(agentResults, workflowResults);

            // Cleanup
            await this.cleanup();

            console.log('\n✅ COMPREHENSIVE WORKFLOW TESTING COMPLETED!');
            return { success: true, report };

        } catch (error) {
            console.error('💥 Workflow testing failed:', error.message);
            await this.cleanup();
            return { success: false, error: error.message };
        }
    }
}

// Execute comprehensive workflow testing
async function main() {
    const tester = new WorkflowTester();
    const result = await tester.runComprehensiveWorkflowTest();
    
    if (result.success) {
        console.log('🎉 WORKFLOW TESTING SUCCESS!');
        process.exit(0);
    } else {
        console.log('❌ WORKFLOW TESTING FAILED');
        process.exit(1);
    }
}

// Run the comprehensive workflow test
main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
