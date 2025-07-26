// AI Agent System Comprehensive Test - Step 1
import dotenv from 'dotenv';
dotenv.config();

console.log('🤖 AI AGENT SYSTEM COMPREHENSIVE TEST');
console.log('🎯 Goal: Make this the best AI system in the world for 7.2 billion people');
console.log('=' .repeat(70));

// Complex test scenarios to challenge all AI agents
const testScenarios = [
    {
        id: 1,
        name: "Complex Emotional Pattern Analysis",
        input: `I've been journaling for weeks about my struggles with anxiety, especially before big presentations at work. Yesterday I wrote about how I couldn't sleep, kept checking my phone, and ate way too much junk food. Last week I had similar patterns before my team meeting. I'm starting to see a cycle but I don't know how to break it. Can you help me understand what's happening and maybe add some insights to my journals to track this better?`,
        expectedAgents: ["supervisor", "emotion", "tags", "retrieval", "memory", "enhancement"],
        testGoals: [
            "Emotion agent should detect anxiety patterns",
            "Tags agent should add relevant tags to journals",
            "Retrieval agent should find similar patterns in memory",
            "Memory agent should create new behavioral pattern memory",
            "Enhancement agent should provide actionable insights"
        ]
    },
    {
        id: 2,
        name: "Multi-Journal Analysis with Goals",
        input: `I want to review my progress on my fitness goals. I've written about workouts in several journal entries over the past month - some days I felt motivated, other days I wanted to quit. Can you look through my fitness-related journals, analyze my progress patterns, and help me create a better plan? Also, tag these entries so I can track them better going forward.`,
        expectedAgents: ["supervisor", "retrieval", "tags", "memory", "enhancement", "report"],
        testGoals: [
            "Retrieval agent should search fitness-related journals",
            "Tags agent should add fitness/motivation/progress tags", 
            "Memory agent should create goals_and_aspirations memory",
            "Report agent should analyze progress patterns",
            "Enhancement agent should suggest improvements"
        ]
    },
    {
        id: 3,
        name: "Complex Personal Insight Generation",
        input: `I've been reflecting on my relationships lately. I notice I tend to avoid conflicts with friends, but then I end up feeling resentful later. This happened again last week with my roommate about chores, and I wrote about it in my journal. I see similar patterns in my work relationships too. I want to understand this pattern better and learn healthier communication strategies. Can you help me analyze my past journal entries about relationships and create insights that will help me grow?`,
        expectedAgents: ["supervisor", "retrieval", "memory", "emotion", "enhancement", "tags"],
        testGoals: [
            "Retrieval agent should find relationship-related entries",
            "Emotion agent should analyze conflict avoidance patterns",
            "Memory agent should create personal_insights memory",
            "Tags agent should add relationship/communication tags",
            "Enhancement agent should provide growth strategies"
        ]
    }
];

async function testAIAgentSystem() {
    try {
        console.log('📋 Initializing AI Agent System...');
        const { query } = await import('./utils/query.js');
        
        const testResults = [];
        
        for (const scenario of testScenarios) {
            console.log(`\n🧪 TESTING SCENARIO ${scenario.id}: ${scenario.name}`);
            console.log('─'.repeat(60));
            console.log(`📝 Input: "${scenario.input.substring(0, 100)}..."`);
            console.log(`🎯 Expected Agents: ${scenario.expectedAgents.join(', ')}`);
            
            const startTime = Date.now();
            
            try {
                console.log('⏳ Processing with AI Agent System...');
                
                const result = await query(scenario.input, {
                    userId: `test_user_${scenario.id}`,
                    authToken: 'test_token_comprehensive'
                });
                
                const endTime = Date.now();
                const processingTime = endTime - startTime;
                
                console.log(`✅ Scenario ${scenario.id} completed in ${processingTime}ms`);
                
                // Analyze the response
                let response = '';
                let structuredData = null;
                
                if (typeof result === 'object') {
                    response = result.combined_response || result.output_text || JSON.stringify(result);
                    // Check for agent workflow results
                    if (result.agent_workflow_result) {
                        console.log('🔄 Agent workflow detected');
                    }
                } else {
                    response = result;
                }
                
                // Check for structured data
                const structuredMatch = response.match(/<!--STRUCTURED_DATA_START-->([\s\S]*?)<!--STRUCTURED_DATA_END-->/);
                if (structuredMatch) {
                    try {
                        structuredData = JSON.parse(structuredMatch[1]);
                        console.log('📊 Structured actions found:', structuredData.actions?.length || 0);
                    } catch (e) {
                        console.log('⚠️ Structured data parsing failed');
                    }
                }
                
                // Analyze response quality
                const responseAnalysis = analyzeResponse(response, scenario);
                
                const scenarioResult = {
                    scenarioId: scenario.id,
                    scenarioName: scenario.name,
                    success: true,
                    processingTime: processingTime,
                    responseLength: response.length,
                    hasStructuredData: !!structuredData,
                    structuredActionsCount: structuredData?.actions?.length || 0,
                    responseAnalysis: responseAnalysis,
                    response: response.substring(0, 500) + (response.length > 500 ? '...' : '')
                };
                
                testResults.push(scenarioResult);
                
                // Display response analysis
                console.log('\n📊 RESPONSE ANALYSIS:');
                console.log(`  Length: ${response.length} characters`);
                console.log(`  Quality Score: ${responseAnalysis.qualityScore}/10`);
                console.log(`  Helpfulness: ${responseAnalysis.helpfulness ? '✅' : '❌'}`);
                console.log(`  Actionable Insights: ${responseAnalysis.actionableInsights ? '✅' : '❌'}`);
                console.log(`  Emotional Intelligence: ${responseAnalysis.emotionalIntelligence ? '✅' : '❌'}`);
                console.log(`  Structured Actions: ${scenarioResult.hasStructuredData ? '✅' : '❌'} (${scenarioResult.structuredActionsCount} actions)`);
                
                console.log('\n📝 SAMPLE RESPONSE:');
                console.log('─'.repeat(50));
                console.log(scenarioResult.response);
                console.log('─'.repeat(50));
                
            } catch (scenarioError) {
                console.error(`❌ Scenario ${scenario.id} failed:`, scenarioError.message);
                testResults.push({
                    scenarioId: scenario.id,
                    scenarioName: scenario.name,
                    success: false,
                    error: scenarioError.message
                });
            }
        }
        
        return {
            success: true,
            totalScenarios: testScenarios.length,
            successfulScenarios: testResults.filter(r => r.success).length,
            results: testResults
        };
        
    } catch (error) {
        console.error('❌ AI Agent System test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Analyze response quality and intelligence
function analyzeResponse(response, scenario) {
    const analysis = {
        qualityScore: 0,
        helpfulness: false,
        actionableInsights: false,
        emotionalIntelligence: false,
        contextualUnderstanding: false,
        personalizedResponse: false
    };
    
    // Check for helpfulness indicators
    const helpfulPhrases = [
        'i understand', 'i can help', 'let me help', 'here\'s what i found',
        'based on your', 'i notice', 'pattern', 'insight', 'suggestion'
    ];
    analysis.helpfulness = helpfulPhrases.some(phrase => 
        response.toLowerCase().includes(phrase)
    );
    if (analysis.helpfulness) analysis.qualityScore += 2;
    
    // Check for actionable insights
    const actionablePhrases = [
        'try', 'consider', 'you could', 'i recommend', 'suggestion',
        'strategy', 'approach', 'technique', 'method', 'practice'
    ];
    analysis.actionableInsights = actionablePhrases.some(phrase =>
        response.toLowerCase().includes(phrase)
    );
    if (analysis.actionableInsights) analysis.qualityScore += 2;
    
    // Check for emotional intelligence
    const emotionPhrases = [
        'feeling', 'emotion', 'anxiety', 'stress', 'pattern', 'understand',
        'empathy', 'support', 'validate', 'acknowledge'
    ];
    analysis.emotionalIntelligence = emotionPhrases.some(phrase =>
        response.toLowerCase().includes(phrase)
    );
    if (analysis.emotionalIntelligence) analysis.qualityScore += 2;
    
    // Check for contextual understanding
    const contextPhrases = [
        'journal', 'entries', 'wrote about', 'patterns', 'track',
        'analyze', 'previous', 'similar', 'recurring'
    ];
    analysis.contextualUnderstanding = contextPhrases.some(phrase =>
        response.toLowerCase().includes(phrase)
    );
    if (analysis.contextualUnderstanding) analysis.qualityScore += 2;
    
    // Check for personalized response
    const personalPhrases = ['your', 'you\'ve', 'you are', 'you tend', 'for you'];
    analysis.personalizedResponse = personalPhrases.some(phrase =>
        response.toLowerCase().includes(phrase)
    );
    if (analysis.personalizedResponse) analysis.qualityScore += 2;
    
    return analysis;
}

// Run the comprehensive test
testAIAgentSystem()
    .then(result => {
        console.log('\n🤖 AI AGENT SYSTEM TEST RESULTS:');
        console.log('=' .repeat(60));
        console.log(`🎯 Overall Success: ${result.success ? '✅' : '❌'}`);
        console.log(`📊 Scenarios Tested: ${result.totalScenarios || 0}`);
        console.log(`✅ Successful Scenarios: ${result.successfulScenarios || 0}`);
        console.log(`📈 Success Rate: ${result.totalScenarios ? Math.round((result.successfulScenarios / result.totalScenarios) * 100) : 0}%`);
        
        if (result.results) {
            const avgProcessingTime = result.results
                .filter(r => r.success && r.processingTime)
                .reduce((sum, r) => sum + r.processingTime, 0) / 
                (result.results.filter(r => r.success && r.processingTime).length || 1);
            
            const avgQualityScore = result.results
                .filter(r => r.success && r.responseAnalysis)
                .reduce((sum, r) => sum + r.responseAnalysis.qualityScore, 0) /
                (result.results.filter(r => r.success && r.responseAnalysis).length || 1);
            
            console.log(`⏱️ Average Processing Time: ${Math.round(avgProcessingTime)}ms`);
            console.log(`🌟 Average Quality Score: ${avgQualityScore.toFixed(1)}/10`);
            
            const structuredDataCount = result.results.filter(r => r.hasStructuredData).length;
            console.log(`📊 Scenarios with Structured Data: ${structuredDataCount}/${result.totalScenarios}`);
        }
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
        
        console.log('\n🎭 SYSTEM EVALUATION:');
        if (result.successfulScenarios === result.totalScenarios) {
            console.log('🏆 EXCELLENT: All scenarios completed successfully!');
            console.log('🚀 Ready for prompt optimization phase');
        } else if (result.successfulScenarios >= result.totalScenarios * 0.8) {
            console.log('👍 GOOD: Most scenarios successful, minor improvements needed');
        } else {
            console.log('⚠️ NEEDS IMPROVEMENT: Several scenarios failed');
        }
        
        console.log('\n📋 NEXT STEPS FOR WORLD-CLASS AI:');
        console.log('1. Analyze response patterns from successful scenarios');
        console.log('2. Identify areas for prompt optimization'); 
        console.log('3. Enhance agent coordination and workflow');
        console.log('4. Improve contextual understanding and personalization');
        console.log('5. Iterate until responses are consistently world-class');
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
