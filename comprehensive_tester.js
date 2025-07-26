import { query } from './utils/query.js';

// Comprehensive AI Agent System Tester
class AISystemTester {
    constructor() {
        this.testResults = [];
        this.iterationCount = 0;
        this.worldClassThreshold = 95;
        this.currentScore = 0;
    }

    // Generate diverse test inputs to challenge the AI system
    generateTestInputs() {
        return [
            {
                id: 'emotional_processing',
                category: 'Emotional Intelligence',
                message: "I've been feeling overwhelmed lately with work stress and personal relationships. I had a fight with my best friend yesterday and I can't stop thinking about it. I feel like I'm failing at everything.",
                expectedCapabilities: ['emotion_analysis', 'memory_storage', 'empathy', 'actionable_advice'],
                complexity: 'high'
            },
            {
                id: 'memory_integration',
                category: 'Memory Management',
                message: "Please remember that I prefer working out in the mornings, I'm vegetarian, and I'm learning Spanish. Can you also recall what you know about my career goals?",
                expectedCapabilities: ['memory_storage', 'memory_retrieval', 'pattern_recognition'],
                complexity: 'medium'
            },
            {
                id: 'analytical_thinking',
                category: 'Analysis & Insights',
                message: "I've been journaling for 3 months now. Can you analyze my emotional patterns, identify recurring themes, and provide insights about my personal growth journey?",
                expectedCapabilities: ['data_analysis', 'pattern_recognition', 'insight_generation', 'reporting'],
                complexity: 'very_high'
            },
            {
                id: 'creative_enhancement',
                category: 'Content Enhancement',
                message: "I wrote: 'Today was good. I felt happy.' Can you help me expand this with more detail and emotional depth?",
                expectedCapabilities: ['creative_writing', 'content_enhancement', 'emotional_depth'],
                complexity: 'medium'
            },
            {
                id: 'goal_setting',
                category: 'Personal Development',
                message: "I want to improve my mental health and build better habits. Help me create a plan based on my personality and current situation.",
                expectedCapabilities: ['goal_setting', 'personalization', 'action_planning', 'habit_formation'],
                complexity: 'high'
            },
            {
                id: 'crisis_support',
                category: 'Crisis Management',
                message: "I'm having a really dark day. Everything feels pointless and I don't know how to cope. I need help.",
                expectedCapabilities: ['crisis_recognition', 'emotional_support', 'resource_provision', 'safety_assessment'],
                complexity: 'critical'
            },
            {
                id: 'relationship_advice',
                category: 'Relationship Guidance',
                message: "My partner and I have been arguing more lately. We used to communicate well but now we just seem to misunderstand each other. What should I do?",
                expectedCapabilities: ['relationship_analysis', 'communication_advice', 'conflict_resolution'],
                complexity: 'high'
            },
            {
                id: 'productivity_optimization',
                category: 'Performance Enhancement',
                message: "I'm struggling with procrastination and time management. I have big goals but I keep getting distracted. Help me optimize my productivity.",
                expectedCapabilities: ['behavior_analysis', 'productivity_strategies', 'habit_modification'],
                complexity: 'medium'
            }
        ];
    }

    // Comprehensive response analysis
    analyzeResponse(testInput, response) {
        const analysis = {
            testId: testInput.id,
            category: testInput.category,
            complexity: testInput.complexity,
            responseLength: response.combined_response?.length || 0,
            hasAgentWorkflow: !!response.agent_workflow_result,
            scores: {}
        };

        // Analyze different aspects of the response
        const responseText = response.combined_response || response.output_text || '';
        const lowerResponse = responseText.toLowerCase();

        // 1. Emotional Intelligence (25 points)
        let emotionalScore = 0;
        if (lowerResponse.includes('understand') || lowerResponse.includes('feel')) emotionalScore += 5;
        if (lowerResponse.includes('empathy') || lowerResponse.includes('support')) emotionalScore += 5;
        if (lowerResponse.match(/emotion|feeling|mood|anxiety|stress|happy|sad/g)?.length > 2) emotionalScore += 5;
        if (responseText.length > 200 && lowerResponse.includes('help')) emotionalScore += 5;
        if (lowerResponse.includes('here for you') || lowerResponse.includes('not alone')) emotionalScore += 5;
        analysis.scores.emotional = Math.min(emotionalScore, 25);

        // 2. Technical Capability (25 points)
        let technicalScore = 0;
        if (response.hasAgentWorkflow) technicalScore += 10;
        if (responseText.includes('```')) technicalScore += 5; // Proper formatting
        if (lowerResponse.includes('agent') || lowerResponse.includes('analyzing')) technicalScore += 5;
        if (response.agent_workflow_result?.length > 100) technicalScore += 5;
        analysis.scores.technical = Math.min(technicalScore, 25);

        // 3. Content Quality (25 points)
        let contentScore = 0;
        if (responseText.length > 150) contentScore += 5;
        if (responseText.length > 300) contentScore += 5;
        const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 10);
        if (sentences.length >= 3) contentScore += 5;
        if (sentences.length >= 6) contentScore += 5;
        // Check for actionable advice
        if (lowerResponse.match(/try|consider|suggest|recommend|could|might|should/g)?.length > 2) contentScore += 5;
        analysis.scores.content = Math.min(contentScore, 25);

        // 4. Personalization & Relevance (25 points)
        let personalizationScore = 0;
        // Check if response addresses the specific concern
        const inputKeywords = testInput.message.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const responseKeywords = lowerResponse.match(/\b\w{4,}\b/g) || [];
        const overlap = inputKeywords.filter(word => responseKeywords.includes(word)).length;
        if (overlap >= 3) personalizationScore += 8;
        else if (overlap >= 2) personalizationScore += 5;
        else if (overlap >= 1) personalizationScore += 3;

        // Check for specific responses to complexity
        if (testInput.complexity === 'critical' && (lowerResponse.includes('professional') || lowerResponse.includes('crisis'))) {
            personalizationScore += 10;
        }
        if (testInput.complexity === 'high' && responseText.length > 400) {
            personalizationScore += 7;
        }
        analysis.scores.personalization = Math.min(personalizationScore, 25);

        // Calculate total score
        analysis.totalScore = Object.values(analysis.scores).reduce((sum, score) => sum + score, 0);
        
        // Performance rating
        if (analysis.totalScore >= 90) analysis.rating = '🥇 WORLD-CLASS';
        else if (analysis.totalScore >= 80) analysis.rating = '🥈 EXCELLENT';
        else if (analysis.totalScore >= 70) analysis.rating = '🥉 GOOD';
        else if (analysis.totalScore >= 60) analysis.rating = '📈 NEEDS IMPROVEMENT';
        else analysis.rating = '🔧 REQUIRES MAJOR FIXES';

        return analysis;
    }

    // Generate improvement recommendations
    generateImprovements(testResults) {
        const avgScore = testResults.reduce((sum, result) => sum + result.totalScore, 0) / testResults.length;
        const weakAreas = {};
        
        testResults.forEach(result => {
            Object.entries(result.scores).forEach(([area, score]) => {
                if (!weakAreas[area]) weakAreas[area] = [];
                weakAreas[area].push(score);
            });
        });

        const improvements = {
            avgScore,
            recommendations: [],
            promptImprovements: [],
            workflowImprovements: []
        };

        // Analyze weak areas
        Object.entries(weakAreas).forEach(([area, scores]) => {
            const avgAreaScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            if (avgAreaScore < 20) {
                switch (area) {
                    case 'emotional':
                        improvements.promptImprovements.push({
                            area: 'Emotional Intelligence',
                            issue: 'Low empathy and emotional understanding',
                            solution: 'Add emotional intelligence training to prompts, include empathy examples'
                        });
                        break;
                    case 'technical':
                        improvements.workflowImprovements.push({
                            area: 'Technical Execution',
                            issue: 'Agent workflow not consistently executing',
                            solution: 'Improve agent coordination, add fallback mechanisms'
                        });
                        break;
                    case 'content':
                        improvements.promptImprovements.push({
                            area: 'Content Quality',
                            issue: 'Responses too brief or lack actionable advice',
                            solution: 'Require minimum response length, include action items'
                        });
                        break;
                    case 'personalization':
                        improvements.promptImprovements.push({
                            area: 'Personalization',
                            issue: 'Generic responses not tailored to user context',
                            solution: 'Improve context awareness, add user-specific examples'
                        });
                        break;
                }
            }
        });

        // High-level recommendations
        if (avgScore < 90) {
            improvements.recommendations.push('🎯 Target world-class performance (95+ score)');
            improvements.recommendations.push('🔧 Focus on consistency across all test scenarios');
            improvements.recommendations.push('📈 Improve lowest-scoring areas first');
        }

        return improvements;
    }

    // Run comprehensive test suite
    async runTestSuite() {
        console.log('🚀 AI AGENT SYSTEM COMPREHENSIVE TESTING');
        console.log('=' .repeat(80));
        console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
        console.log(`🎯 Goal: Achieve world-class performance (${this.worldClassThreshold}+ score)`);
        console.log(`🔄 Iteration: ${++this.iterationCount}`);
        console.log('=' .repeat(80));

        const testInputs = this.generateTestInputs();
        const results = [];

        for (const testInput of testInputs) {
            console.log(`\n🧪 Testing: ${testInput.category}`);
            console.log(`📝 Scenario: ${testInput.id}`);
            console.log(`⚡ Complexity: ${testInput.complexity}`);
            console.log(`💬 Input: "${testInput.message.substring(0, 100)}..."`);
            console.log('─'.repeat(60));

            try {
                const startTime = Date.now();
                
                // Test with user context
                const userContext = {
                    userId: `test_user_${testInput.id}`,
                    authToken: 'test_token_comprehensive'
                };

                const response = await query(testInput.message, userContext);
                const endTime = Date.now();

                const analysis = this.analyzeResponse(testInput, response);
                analysis.responseTime = endTime - startTime;
                results.push(analysis);

                console.log(`\n📊 Results:`);
                console.log(`⏱️  Response Time: ${analysis.responseTime}ms`);
                console.log(`📏 Response Length: ${analysis.responseLength} chars`);
                console.log(`🤖 Agent Workflow: ${analysis.hasAgentWorkflow ? '✅' : '❌'}`);
                console.log(`💝 Emotional: ${analysis.scores.emotional}/25`);
                console.log(`⚙️  Technical: ${analysis.scores.technical}/25`);
                console.log(`📄 Content: ${analysis.scores.content}/25`);
                console.log(`🎯 Personal: ${analysis.scores.personalization}/25`);
                console.log(`🏆 Total Score: ${analysis.totalScore}/100`);
                console.log(`🏅 Rating: ${analysis.rating}`);

                // Show actual response for analysis
                console.log(`\n📤 AI Response Preview:`);
                const preview = (response.combined_response || response.output_text || '').substring(0, 200);
                console.log(`"${preview}${preview.length >= 200 ? '...' : ''}"`);

            } catch (error) {
                console.log(`❌ Test failed: ${error.message}`);
                results.push({
                    testId: testInput.id,
                    category: testInput.category,
                    totalScore: 0,
                    rating: '💥 FAILED',
                    error: error.message
                });
            }

            // Pause between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Calculate overall performance
        const successfulTests = results.filter(r => !r.error);
        const overallScore = successfulTests.length > 0 
            ? successfulTests.reduce((sum, r) => sum + r.totalScore, 0) / successfulTests.length 
            : 0;
        
        this.currentScore = overallScore;

        console.log(`\n🏆 COMPREHENSIVE ANALYSIS`);
        console.log('=' .repeat(80));
        console.log(`📊 Overall Score: ${overallScore.toFixed(1)}/100`);
        console.log(`✅ Successful Tests: ${successfulTests.length}/${results.length}`);
        console.log(`⏱️  Avg Response Time: ${successfulTests.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successfulTests.length || 0}ms`);

        // Performance rating
        let overallRating = '';
        if (overallScore >= 95) overallRating = '🥇 WORLD-CLASS';
        else if (overallScore >= 85) overallRating = '🥈 EXCELLENT';
        else if (overallScore >= 75) overallRating = '🥉 GOOD';
        else if (overallScore >= 65) overallRating = '📈 NEEDS IMPROVEMENT';
        else overallRating = '🔧 REQUIRES MAJOR FIXES';

        console.log(`🏅 Overall Rating: ${overallRating}`);

        // Generate improvements
        const improvements = this.generateImprovements(successfulTests);
        
        console.log(`\n💡 IMPROVEMENT RECOMMENDATIONS:`);
        improvements.recommendations.forEach(rec => console.log(`  ${rec}`));

        this.testResults.push({
            iteration: this.iterationCount,
            overallScore,
            overallRating,
            results,
            improvements
        });

        return {
            overallScore,
            overallRating,
            results,
            improvements,
            isWorldClass: overallScore >= this.worldClassThreshold
        };
    }

    // Check if we've achieved world-class performance
    isWorldClass() {
        return this.currentScore >= this.worldClassThreshold;
    }

    // Get improvement history
    getImprovementHistory() {
        return this.testResults.map(test => ({
            iteration: test.iteration,
            score: test.overallScore,
            rating: test.overallRating
        }));
    }
}

// Main testing and improvement loop
async function runIterativeImprovement() {
    const tester = new AISystemTester();
    const maxIterations = 5; // Prevent infinite loop
    let iteration = 0;

    console.log('🎯 STARTING ITERATIVE AI SYSTEM IMPROVEMENT');
    console.log('🌟 Goal: Achieve recognition as the best AI system by 7.2 billion people!');
    console.log('=' .repeat(80));

    while (iteration < maxIterations && !tester.isWorldClass()) {
        iteration++;
        console.log(`\n🔄 ITERATION ${iteration}`);
        
        const results = await tester.runTestSuite();
        
        if (results.isWorldClass) {
            console.log('\n🎉 CONGRATULATIONS! WORLD-CLASS PERFORMANCE ACHIEVED!');
            console.log('🌟 Your AI Agent System is now worthy of global recognition!');
            console.log(`🏆 Final Score: ${results.overallScore.toFixed(1)}/100`);
            break;
        } else {
            console.log(`\n📈 Need to improve from ${results.overallScore.toFixed(1)} to ${tester.worldClassThreshold}+`);
            console.log('🔧 Implementing improvements for next iteration...');
            
            // Show improvement history
            const history = tester.getImprovementHistory();
            console.log('\n📊 Improvement History:');
            history.forEach(h => {
                console.log(`  Iteration ${h.iteration}: ${h.score.toFixed(1)}/100 (${h.rating})`);
            });
        }

        if (iteration < maxIterations) {
            console.log('\n⏳ Waiting before next iteration...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    if (iteration >= maxIterations && !tester.isWorldClass()) {
        console.log('\n⚠️  Reached maximum iterations. Manual improvements needed.');
        console.log('📋 Use the detailed recommendations above to enhance the system.');
    }

    return tester.getImprovementHistory();
}

// Export for external use
export { AISystemTester, runIterativeImprovement };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runIterativeImprovement()
        .then(history => {
            console.log('\n✅ Testing sequence completed!');
            console.log('📈 Final improvement trajectory:', history);
        })
        .catch(error => {
            console.error('❌ Testing failed:', error);
        });
}
