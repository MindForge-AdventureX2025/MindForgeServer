import { queryStream, BackendTools } from './utils/query.js';
import { EventEmitter } from 'events';

// Mock response object for testing
class MockResponse extends EventEmitter {
    constructor() {
        super();
        this.chunks = [];
        this.status = null;
        this.isComplete = false;
    }

    write(data) {
        this.chunks.push(data);
        console.log(`📤 Response chunk: ${data.trim()}`);
        
        // Parse JSON data if possible
        try {
            const jsonMatch = data.match(/data: (.+)/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                if (parsed.status === 'workflow_complete') {
                    this.isComplete = true;
                    this.emit('complete');
                }
            }
        } catch (e) {
            // Not JSON, continue
        }
    }

    end() {
        this.isComplete = true;
        this.emit('complete');
    }

    getFullResponse() {
        return this.chunks.join('');
    }

    getProcessingSteps() {
        const steps = [];
        this.chunks.forEach(chunk => {
            try {
                const jsonMatch = chunk.match(/data: (.+)/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[1]);
                    if (parsed.status) {
                        steps.push({
                            status: parsed.status,
                            agent: parsed.agent || null,
                            chunk: parsed.chunk || null
                        });
                    }
                }
            } catch (e) {}
        });
        return steps;
    }
}

// Test message scenarios
const testScenarios = [
    {
        name: "🎯 Simple Emotional Journal Analysis",
        message: "I had a really tough day at work today. My boss criticized my presentation in front of the whole team and I felt embarrassed and frustrated. I couldn't focus on anything else afterward.",
        expectedAgents: ['supervisor', 'emotion', 'memory', 'summarization'],
        complexity: 'simple'
    },
    {
        name: "🔍 Complex Multi-Domain Request",
        message: "I've been feeling anxious about my career lately. I want to analyze my previous journal entries about work stress, find patterns in my emotional responses, and create a plan to improve my professional confidence. Also, please save any insights about my behavioral patterns.",
        expectedAgents: ['supervisor', 'retrieval', 'emotion', 'tags', 'memory', 'report'],
        complexity: 'complex'
    },
    {
        name: "💾 Memory and Data Management",
        message: "Can you help me understand what personal insights you have stored about me? I'd like to see my emotional patterns from the last month and update my goals based on recent achievements.",
        expectedAgents: ['supervisor', 'retrieval', 'memory', 'summarization'],
        complexity: 'medium'
    },
    {
        name: "📊 Analytics and Reporting",
        message: "Create a comprehensive report about my personal growth journey. Include my emotional evolution, recurring themes in my journal entries, and recommendations for future development.",
        expectedAgents: ['supervisor', 'retrieval', 'emotion', 'tags', 'summarization', 'report'],
        complexity: 'complex'
    },
    {
        name: "🎨 Creative Enhancement Request",
        message: "I wrote a brief journal entry about feeling lonely. Can you help me expand it with more emotional depth and suggest ways to improve my self-expression?",
        expectedAgents: ['supervisor', 'emotion', 'enhancement', 'memory'],
        complexity: 'medium'
    }
];

// User context for testing
const testUserContext = {
    userId: 'test_user_12345',
    authToken: 'test_token_67890'
};

// Rating criteria for AI agent performance
const ratingCriteria = {
    responseQuality: {
        clarity: 'How clear and understandable are the responses?',
        relevance: 'How relevant are the responses to the user request?',
        completeness: 'How complete are the responses?',
        actionability: 'How actionable are the insights provided?'
    },
    workflowEfficiency: {
        agentSelection: 'Were the right agents selected for the task?',
        coordination: 'How well did agents coordinate with each other?',
        iterationCount: 'Were there too many or too few iterations?',
        errorHandling: 'How well were errors handled?'
    },
    technicalPerformance: {
        responseTime: 'How fast were the responses?',
        toolUsage: 'Were backend tools used effectively?',
        memoryIntegration: 'How well was the RAG memory system utilized?',
        streamingQuality: 'How smooth was the streaming experience?'
    },
    userExperience: {
        transparency: 'How transparent was the agent processing?',
        engagement: 'How engaging was the interaction?',
        trust: 'Did the responses build user trust?',
        satisfaction: 'Overall user satisfaction level?'
    }
};

// Test execution function
async function runTest(scenario) {
    console.log(`\n🚀 Starting test: ${scenario.name}`);
    console.log(`📝 Message: "${scenario.message}"`);
    console.log(`🎯 Expected complexity: ${scenario.complexity}`);
    console.log(`👥 Expected agents: ${scenario.expectedAgents.join(', ')}`);
    console.log('─'.repeat(80));

    const mockRes = new MockResponse();
    const startTime = Date.now();
    
    try {
        // Execute queryStream
        const resultPromise = queryStream(scenario.message, mockRes, testUserContext);
        
        // Wait for completion
        await new Promise((resolve) => {
            mockRes.on('complete', resolve);
            setTimeout(resolve, 30000); // 30 second timeout
        });
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        // Analyze results
        const processingSteps = mockRes.getProcessingSteps();
        const fullResponse = mockRes.getFullResponse();
        
        console.log(`\n📊 Test Results for: ${scenario.name}`);
        console.log(`⏱️  Processing time: ${processingTime}ms`);
        console.log(`🔄 Processing steps: ${processingSteps.length}`);
        console.log(`📏 Response length: ${fullResponse.length} characters`);
        
        // Agent analysis
        const agentsUsed = [...new Set(processingSteps
            .filter(step => step.agent)
            .map(step => step.agent))];
        
        console.log(`\n👥 Agents Used: ${agentsUsed.join(', ')}`);
        console.log(`✅ Expected agents coverage: ${scenario.expectedAgents.filter(agent => 
            agentsUsed.includes(agent)).length}/${scenario.expectedAgents.length}`);
        
        // Processing flow analysis
        console.log(`\n🔄 Processing Flow:`);
        processingSteps.forEach((step, index) => {
            console.log(`  ${index + 1}. ${step.status} ${step.agent ? `[${step.agent}]` : ''}`);
        });
        
        return {
            scenario: scenario.name,
            success: true,
            processingTime,
            agentsUsed,
            expectedAgentsCoverage: scenario.expectedAgents.filter(agent => 
                agentsUsed.includes(agent)).length / scenario.expectedAgents.length,
            processingSteps: processingSteps.length,
            responseLength: fullResponse.length,
            processingFlow: processingSteps,
            fullResponse: fullResponse
        };
        
    } catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
        return {
            scenario: scenario.name,
            success: false,
            error: error.message,
            processingTime: Date.now() - startTime
        };
    }
}

// Rate test results
function rateTestResults(results) {
    console.log(`\n🏆 RATING TEST RESULTS`);
    console.log('='.repeat(80));
    
    let totalScore = 0;
    let maxScore = 0;
    
    results.forEach((result, index) => {
        if (!result.success) {
            console.log(`❌ ${result.scenario}: FAILED - ${result.error}`);
            return;
        }
        
        console.log(`\n📊 Rating: ${result.scenario}`);
        
        // Response Quality (25 points)
        let responseQuality = 0;
        responseQuality += result.responseLength > 500 ? 5 : Math.floor(result.responseLength / 100); // Completeness
        responseQuality += result.expectedAgentsCoverage >= 0.8 ? 10 : result.expectedAgentsCoverage * 10; // Relevance
        responseQuality += result.fullResponse.includes('```') ? 5 : 0; // Formatting
        responseQuality += result.processingSteps > 5 ? 5 : result.processingSteps; // Depth
        responseQuality = Math.min(responseQuality, 25);
        
        // Workflow Efficiency (25 points)
        let workflowEfficiency = 0;
        workflowEfficiency += result.agentsUsed.includes('supervisor') ? 5 : 0; // Coordination
        workflowEfficiency += result.processingSteps <= 15 ? 10 : Math.max(0, 10 - (result.processingSteps - 15)); // Efficiency
        workflowEfficiency += result.expectedAgentsCoverage >= 0.7 ? 10 : result.expectedAgentsCoverage * 10; // Selection
        workflowEfficiency = Math.min(workflowEfficiency, 25);
        
        // Technical Performance (25 points)
        let technicalPerformance = 0;
        technicalPerformance += result.processingTime < 10000 ? 10 : Math.max(0, 10 - Math.floor((result.processingTime - 10000) / 1000)); // Speed
        technicalPerformance += result.agentsUsed.includes('memory') ? 5 : 0; // Memory integration
        technicalPerformance += result.agentsUsed.includes('retrieval') ? 5 : 0; // Tool usage
        technicalPerformance += result.processingFlow.some(step => step.status.includes('complete')) ? 5 : 0; // Completion
        technicalPerformance = Math.min(technicalPerformance, 25);
        
        // User Experience (25 points)
        let userExperience = 0;
        userExperience += result.processingFlow.some(step => step.chunk && step.chunk.includes('agent')) ? 10 : 0; // Transparency
        userExperience += result.fullResponse.toLowerCase().includes('i am') ? 5 : 0; // Status updates
        userExperience += result.processingFlow.length > 3 ? 5 : 0; // Engagement
        userExperience += result.success ? 5 : 0; // Satisfaction
        userExperience = Math.min(userExperience, 25);
        
        const testScore = responseQuality + workflowEfficiency + technicalPerformance + userExperience;
        totalScore += testScore;
        maxScore += 100;
        
        console.log(`  📝 Response Quality: ${responseQuality}/25`);
        console.log(`  🔄 Workflow Efficiency: ${workflowEfficiency}/25`);
        console.log(`  ⚡ Technical Performance: ${technicalPerformance}/25`);
        console.log(`  😊 User Experience: ${userExperience}/25`);
        console.log(`  🎯 Total Score: ${testScore}/100 (${(testScore/100*100).toFixed(1)}%)`);
    });
    
    const overallScore = totalScore / maxScore * 100;
    console.log(`\n🏆 OVERALL SCORE: ${overallScore.toFixed(1)}/100`);
    
    // Performance rating
    let rating = '';
    if (overallScore >= 90) rating = '🥇 WORLD-CLASS';
    else if (overallScore >= 80) rating = '🥈 EXCELLENT';
    else if (overallScore >= 70) rating = '🥉 GOOD';
    else if (overallScore >= 60) rating = '📈 NEEDS IMPROVEMENT';
    else rating = '🔧 REQUIRES MAJOR FIXES';
    
    console.log(`📊 Performance Rating: ${rating}`);
    
    return {
        overallScore,
        rating,
        results,
        totalTests: results.length,
        successfulTests: results.filter(r => r.success).length
    };
}

// Main test execution
async function runAllTests() {
    console.log('🧪 MINDFORGE AI AGENT SYSTEM - COMPREHENSIVE TESTING');
    console.log('='.repeat(80));
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`🎯 Goal: Achieve WORLD-CLASS ranking through iterative improvement`);
    console.log(`📊 Test Scenarios: ${testScenarios.length}`);
    console.log('='.repeat(80));

    const results = [];
    
    for (const scenario of testScenarios) {
        const result = await runTest(scenario);
        results.push(result);
        
        // Wait between tests to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Rate and analyze results
    const analysis = rateTestResults(results);
    
    console.log(`\n🔍 DETAILED ANALYSIS & IMPROVEMENT RECOMMENDATIONS`);
    console.log('='.repeat(80));
    
    return analysis;
}

// Export for external use
export { runAllTests, testScenarios, ratingCriteria };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().then(analysis => {
        console.log('\n✅ Testing completed!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Testing failed:', error);
        process.exit(1);
    });
}
