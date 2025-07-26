// World-Class AI System Test - Post Optimization
import dotenv from 'dotenv';
dotenv.config();

console.log('🌟 WORLD-CLASS AI SYSTEM TEST - POST OPTIMIZATION');
console.log('🎯 Testing optimized prompts and enhanced workflows');
console.log('=' .repeat(70));

async function testWorldClassSystem() {
    try {
        console.log('📋 Loading optimized AI system...');
        const { query } = await import('./utils/query.js');
        
        // Test scenarios designed to challenge the optimized system
        const worldClassTests = [
            {
                name: "Emotional Intelligence + Tags + Memory Integration",
                input: `I've been struggling with anxiety before important meetings at work. Yesterday I wrote in my journal about how I couldn't sleep before today's presentation, and I see this pattern happening repeatedly. Can you help me understand what's going on and organize my thoughts better?`,
                expectedFeatures: [
                    "Deep emotional understanding",
                    "Automatic journal tagging", 
                    "Memory creation for patterns",
                    "Actionable insights",
                    "Backend actions triggered"
                ]
            },
            {
                name: "Complex Pattern Analysis + Multi-Agent Coordination",
                input: `Looking at my journal entries over the past month, I notice I'm more productive in the mornings but struggle with motivation in afternoons. I want to understand this pattern better and get suggestions for optimizing my daily routine. Can you analyze my productivity patterns and help me improve?`,
                expectedFeatures: [
                    "Pattern recognition across time",
                    "Multiple agents working together",
                    "Structured memory creation",
                    "Personalized recommendations",
                    "Fast processing time"
                ]
            },
            {
                name: "Relationship Insights + Growth Tracking",
                input: `I've been journaling about some conflicts I've had with my partner lately. I notice I tend to avoid difficult conversations, but then I end up feeling resentful. This seems to be a pattern in my relationships. Help me understand this better and create tags to track my relationship patterns going forward.`,
                expectedFeatures: [
                    "Relationship pattern analysis",
                    "Emotional insight generation",
                    "Behavioral pattern recognition", 
                    "Growth-oriented suggestions",
                    "Smart tagging for tracking"
                ]
            }
        ];
        
        const results = [];
        
        for (const [index, test] of worldClassTests.entries()) {
            console.log(`\n🧪 TEST ${index + 1}: ${test.name}`);
            console.log('─'.repeat(60));
            console.log(`📝 Input: "${test.input.substring(0, 100)}..."`);
            console.log(`🎯 Expected: ${test.expectedFeatures.join(', ')}`);
            
            const startTime = Date.now();
            
            try {
                console.log('⏳ Processing with optimized AI system...');
                
                const result = await query(test.input, {
                    userId: `worldclass_test_${index + 1}`,
                    authToken: 'worldclass_token'
                });
                
                const endTime = Date.now();
                const processingTime = endTime - startTime;
                
                // Analyze the response
                let response = '';
                let hasAgentWorkflow = false;
                
                if (typeof result === 'object') {
                    response = result.combined_response || result.output_text || JSON.stringify(result);
                    hasAgentWorkflow = !!result.agent_workflow_result;
                } else {
                    response = result;
                }
                
                // Check for structured data (backend actions)
                const hasStructuredData = response.includes('<!--STRUCTURED_DATA_START-->');
                let structuredActions = 0;
                
                if (hasStructuredData) {
                    const structuredMatch = response.match(/<!--STRUCTURED_DATA_START-->([\s\S]*?)<!--STRUCTURED_DATA_END-->/);
                    if (structuredMatch) {
                        try {
                            const structuredData = JSON.parse(structuredMatch[1]);
                            structuredActions = structuredData.actions?.length || 0;
                        } catch (e) {
                            console.log('⚠️ Structured data parsing failed');
                        }
                    }
                }
                
                // Analyze response quality
                const qualityAnalysis = analyzeWorldClassResponse(response, test);
                
                const testResult = {
                    testName: test.name,
                    success: true,
                    processingTime,
                    responseLength: response.length,
                    hasAgentWorkflow,
                    hasStructuredData,
                    structuredActions,
                    qualityScore: qualityAnalysis.overallScore,
                    qualityAnalysis,
                    response: response.substring(0, 300) + (response.length > 300 ? '...' : '')
                };
                
                results.push(testResult);
                
                console.log(`✅ Test ${index + 1} completed in ${processingTime}ms`);
                console.log('\n📊 QUALITY ANALYSIS:');
                console.log(`  Overall Score: ${qualityAnalysis.overallScore}/10`);
                console.log(`  Emotional Intelligence: ${qualityAnalysis.emotionalIntelligence ? '✅' : '❌'}`);
                console.log(`  Personalization: ${qualityAnalysis.personalization ? '✅' : '❌'}`);
                console.log(`  Actionable Insights: ${qualityAnalysis.actionableInsights ? '✅' : '❌'}`);
                console.log(`  Pattern Recognition: ${qualityAnalysis.patternRecognition ? '✅' : '❌'}`);
                console.log(`  Backend Actions: ${hasStructuredData ? '✅' : '❌'} (${structuredActions} actions)`);
                console.log(`  Agent Workflow: ${hasAgentWorkflow ? '✅' : '❌'}`);
                console.log(`  Processing Speed: ${processingTime < 8000 ? '✅ Fast' : processingTime < 15000 ? '⚠️ Moderate' : '❌ Slow'}`);
                
                console.log('\n📝 SAMPLE RESPONSE:');
                console.log('─'.repeat(50));
                console.log(testResult.response);
                console.log('─'.repeat(50));
                
            } catch (testError) {
                console.error(`❌ Test ${index + 1} failed:`, testError.message);
                results.push({
                    testName: test.name,
                    success: false,
                    error: testError.message
                });
            }
        }
        
        return {
            success: true,
            totalTests: worldClassTests.length,
            successfulTests: results.filter(r => r.success).length,
            results: results
        };
        
    } catch (error) {
        console.error('❌ World-class system test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Advanced response quality analysis for world-class standards
function analyzeWorldClassResponse(response, test) {
    const analysis = {
        overallScore: 0,
        emotionalIntelligence: false,
        personalization: false,
        actionableInsights: false,
        patternRecognition: false,
        empathy: false,
        clarity: false,
        comprehensiveness: false
    };
    
    const responseLower = response.toLowerCase();
    
    // Emotional Intelligence (2 points)
    const emotionalPhrases = [
        'understand', 'feel', 'emotion', 'empathy', 'support', 'validate',
        'acknowledge', 'resonate', 'relate', 'compassion'
    ];
    analysis.emotionalIntelligence = emotionalPhrases.some(phrase => 
        responseLower.includes(phrase)
    );
    if (analysis.emotionalIntelligence) analysis.overallScore += 2;
    
    // Personalization (2 points) 
    const personalPhrases = [
        'your pattern', 'your experience', 'for you', 'your situation',
        'you mentioned', 'you\'ve noticed', 'your journal', 'you tend'
    ];
    analysis.personalization = personalPhrases.some(phrase =>
        responseLower.includes(phrase)
    );
    if (analysis.personalization) analysis.overallScore += 2;
    
    // Actionable Insights (2 points)
    const actionablePhrases = [
        'try', 'consider', 'suggest', 'recommend', 'could', 'might',
        'practice', 'technique', 'strategy', 'approach', 'next step'
    ];
    analysis.actionableInsights = actionablePhrases.some(phrase =>
        responseLower.includes(phrase)
    );
    if (analysis.actionableInsights) analysis.overallScore += 2;
    
    // Pattern Recognition (2 points)
    const patternPhrases = [
        'pattern', 'cycle', 'recurring', 'repeatedly', 'tends to',
        'often', 'consistently', 'theme', 'common', 'similar'
    ];
    analysis.patternRecognition = patternPhrases.some(phrase =>
        responseLower.includes(phrase)
    );
    if (analysis.patternRecognition) analysis.overallScore += 2;
    
    // Empathy (1 point)
    const empathyPhrases = [
        'makes sense', 'understandable', 'natural', 'common',
        'many people', 'you\'re not alone', 'valid'
    ];
    analysis.empathy = empathyPhrases.some(phrase =>
        responseLower.includes(phrase)
    );
    if (analysis.empathy) analysis.overallScore += 1;
    
    // Clarity (1 point)
    const clarityIndicators = [
        response.length > 100 && response.length < 1000, // Good length
        !responseLower.includes('undefined'),
        !responseLower.includes('error'),
        response.split('.').length > 2 // Multiple sentences
    ];
    analysis.clarity = clarityIndicators.filter(Boolean).length >= 3;
    if (analysis.clarity) analysis.overallScore += 1;
    
    return analysis;
}

// Run the world-class test
testWorldClassSystem()
    .then(result => {
        console.log('\n🌟 WORLD-CLASS SYSTEM RESULTS:');
        console.log('=' .repeat(60));
        console.log(`🎯 Overall Success: ${result.success ? '✅' : '❌'}`);
        console.log(`📊 Tests Completed: ${result.totalTests || 0}`);
        console.log(`✅ Successful Tests: ${result.successfulTests || 0}`);
        console.log(`📈 Success Rate: ${result.totalTests ? Math.round((result.successfulTests / result.totalTests) * 100) : 0}%`);
        
        if (result.results) {
            const avgProcessingTime = result.results
                .filter(r => r.success && r.processingTime)
                .reduce((sum, r) => sum + r.processingTime, 0) / 
                (result.results.filter(r => r.success && r.processingTime).length || 1);
            
            const avgQualityScore = result.results
                .filter(r => r.success && r.qualityScore)
                .reduce((sum, r) => sum + r.qualityScore, 0) /
                (result.results.filter(r => r.success && r.qualityScore).length || 1);
            
            const structuredDataTests = result.results.filter(r => r.hasStructuredData).length;
            const agentWorkflowTests = result.results.filter(r => r.hasAgentWorkflow).length;
            
            console.log(`⏱️ Average Processing Time: ${Math.round(avgProcessingTime)}ms`);
            console.log(`🌟 Average Quality Score: ${avgQualityScore.toFixed(1)}/10`);
            console.log(`📊 Tests with Backend Actions: ${structuredDataTests}/${result.totalTests}`);
            console.log(`🔄 Tests with Agent Workflow: ${agentWorkflowTests}/${result.totalTests}`);
        }
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
        
        console.log('\n🏆 WORLD-CLASS EVALUATION:');
        const successRate = result.totalTests ? (result.successfulTests / result.totalTests) : 0;
        
        if (successRate === 1 && result.results && result.results.every(r => r.qualityScore >= 8)) {
            console.log('🥇 WORLD-CLASS STATUS ACHIEVED!');
            console.log('🎉 This AI system is ready to amaze 7.2 billion people!');
        } else if (successRate >= 0.8) {
            console.log('🥈 EXCELLENT PERFORMANCE - Minor optimizations needed');
        } else if (successRate >= 0.6) {
            console.log('🥉 GOOD PERFORMANCE - Significant improvements needed');
        } else {
            console.log('🔧 NEEDS MAJOR OPTIMIZATION - Continue iterating');
        }
        
        console.log('\n📋 NEXT OPTIMIZATION TARGETS:');
        if (result.results) {
            const improvements = [];
            
            const avgProcessingTime = result.results.reduce((sum, r) => sum + (r.processingTime || 0), 0) / result.results.length;
            if (avgProcessingTime > 8000) improvements.push('⚡ Reduce processing time');
            
            const avgQualityScore = result.results.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / result.results.length;
            if (avgQualityScore < 8.5) improvements.push('🌟 Improve response quality');
            
            const structuredDataRate = result.results.filter(r => r.hasStructuredData).length / result.results.length;
            if (structuredDataRate < 0.8) improvements.push('📊 Increase backend action triggers');
            
            if (improvements.length === 0) {
                console.log('✅ No improvements needed - System is world-class!');
            } else {
                improvements.forEach(improvement => console.log(improvement));
            }
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 World-class test execution failed:', error);
        process.exit(1);
    });
