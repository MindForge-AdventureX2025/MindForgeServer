// Test Input Generator and Response Analyzer
import dotenv from 'dotenv';
dotenv.config();

console.log('🎯 AI SYSTEM OPTIMIZATION FRAMEWORK');
console.log('=' .repeat(60));

// Generate comprehensive test input based on emotional intelligence
function generateTestInput() {
    const scenarios = [
        {
            type: 'anxiety_work',
            message: "I've been struggling with work anxiety lately. Every morning I wake up with this knot in my stomach thinking about all the tasks I need to complete. My manager has been putting more pressure on the team, and I feel like I'm drowning. I had a panic attack during yesterday's meeting and I'm worried it might happen again. How can I manage this overwhelming feeling and perform better at work?",
            expectedElements: ['anxiety management', 'work stress', 'panic attack', 'performance improvement', 'emotional support']
        },
        {
            type: 'relationship_conflict',
            message: "My best friend and I had a huge fight last week over something that seems stupid now, but it really hurt me. She said I was being too sensitive and that I always make everything about myself. I've been replaying the conversation in my head constantly, and I can't sleep properly. I miss her but I'm also angry. Should I reach out first or wait for her to apologize? I don't know how to handle this situation.",
            expectedElements: ['relationship repair', 'emotional processing', 'conflict resolution', 'self-reflection', 'communication advice']
        },
        {
            type: 'personal_growth',
            message: "I've been journaling for the past few months, and I'm starting to notice some patterns in my behavior that I don't like. I tend to procrastinate when I'm stressed, I avoid difficult conversations, and I often doubt my own abilities even when others praise my work. I want to break these cycles and become a better version of myself, but I don't know where to start. Can you help me create a plan for personal development?",
            expectedElements: ['self-awareness', 'behavior change', 'personal development plan', 'habit formation', 'growth mindset']
        }
    ];
    
    return scenarios[Math.floor(Math.random() * scenarios.length)];
}

// Comprehensive response analyzer
function analyzeResponse(input, response, responseTime) {
    const analysis = {
        input: input,
        responseTime: responseTime,
        basicMetrics: {},
        contentAnalysis: {},
        emotionalIntelligence: {},
        technicalCapability: {},
        overallScore: 0,
        improvements: []
    };
    
    const responseText = response.combined_response || response.output_text || '';
    const lowerResponse = responseText.toLowerCase();
    const lowerInput = input.message.toLowerCase();
    
    // Basic Metrics
    analysis.basicMetrics = {
        responseLength: responseText.length,
        wordCount: responseText.split(/\s+/).filter(word => word.length > 0).length,
        sentenceCount: responseText.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        hasAgentWorkflow: !!response.agent_workflow_result,
        agentWorkflowLength: response.agent_workflow_result?.length || 0
    };
    
    // Content Analysis (25 points)
    let contentScore = 0;
    
    // Length and structure
    if (analysis.basicMetrics.wordCount >= 100) contentScore += 5;
    if (analysis.basicMetrics.wordCount >= 200) contentScore += 5;
    if (analysis.basicMetrics.sentenceCount >= 5) contentScore += 5;
    
    // Actionable advice
    const actionWords = ['try', 'consider', 'practice', 'start', 'focus', 'remember', 'avoid', 'continue'];
    const actionCount = actionWords.filter(word => lowerResponse.includes(word)).length;
    if (actionCount >= 3) contentScore += 5;
    if (actionCount >= 5) contentScore += 5;
    
    analysis.contentAnalysis = { score: contentScore, actionWords: actionCount };
    
    // Emotional Intelligence (25 points)
    let emotionalScore = 0;
    
    // Empathy indicators
    const empathyPhrases = ['understand', 'feel', 'sounds difficult', 'sounds challenging', 'i hear you', 'that must be'];
    const empathyCount = empathyPhrases.filter(phrase => lowerResponse.includes(phrase)).length;
    if (empathyCount >= 2) emotionalScore += 8;
    else if (empathyCount >= 1) emotionalScore += 4;
    
    // Emotional validation
    if (lowerResponse.includes('valid') || lowerResponse.includes('normal') || lowerResponse.includes('understandable')) {
        emotionalScore += 5;
    }
    
    // Specific emotion addressing
    const inputEmotions = ['anxious', 'anxiety', 'angry', 'hurt', 'worried', 'stress', 'overwhelm'];
    const addressedEmotions = inputEmotions.filter(emotion => 
        lowerInput.includes(emotion) && lowerResponse.includes(emotion)
    ).length;
    if (addressedEmotions >= 2) emotionalScore += 7;
    else if (addressedEmotions >= 1) emotionalScore += 4;
    
    // Support language
    if (lowerResponse.includes('help') || lowerResponse.includes('support') || lowerResponse.includes('here for you')) {
        emotionalScore += 5;
    }
    
    analysis.emotionalIntelligence = { score: emotionalScore, empathyCount, addressedEmotions };
    
    // Technical Capability (25 points)
    let technicalScore = 0;
    
    // Agent workflow execution
    if (response.agent_workflow_result) technicalScore += 10;
    if (analysis.basicMetrics.agentWorkflowLength > 100) technicalScore += 5;
    
    // Response completeness
    if (responseText.includes('```') || responseText.includes('**')) technicalScore += 3; // Formatting
    if (responseTime < 10000) technicalScore += 4; // Speed
    else if (responseTime < 20000) technicalScore += 2;
    
    // Error handling
    if (!responseText.includes('error') && !responseText.includes('sorry, i cannot')) technicalScore += 3;
    
    analysis.technicalCapability = { score: technicalScore, responseTime, hasWorkflow: !!response.agent_workflow_result };
    
    // Personalization & Relevance (25 points)
    let personalizationScore = 0;
    
    // Keyword relevance
    const inputKeywords = input.message.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const responseKeywords = lowerResponse.match(/\b\w{4,}\b/g) || [];
    const keywordOverlap = inputKeywords.filter(word => responseKeywords.includes(word)).length;
    
    if (keywordOverlap >= 5) personalizationScore += 8;
    else if (keywordOverlap >= 3) personalizationScore += 5;
    else if (keywordOverlap >= 1) personalizationScore += 2;
    
    // Expected elements coverage
    const expectedElements = input.expectedElements || [];
    const coveredElements = expectedElements.filter(element => 
        lowerResponse.includes(element.replace(/ /g, '')) || 
        element.split(' ').every(word => lowerResponse.includes(word))
    ).length;
    
    if (expectedElements.length > 0) {
        const coverageRatio = coveredElements / expectedElements.length;
        if (coverageRatio >= 0.8) personalizationScore += 10;
        else if (coverageRatio >= 0.6) personalizationScore += 7;
        else if (coverageRatio >= 0.4) personalizationScore += 4;
        else if (coverageRatio >= 0.2) personalizationScore += 2;
    }
    
    // Specific scenario addressing
    if (input.type.includes('anxiety') && (lowerResponse.includes('calm') || lowerResponse.includes('relax'))) {
        personalizationScore += 4;
    }
    if (input.type.includes('relationship') && (lowerResponse.includes('communicate') || lowerResponse.includes('apologize'))) {
        personalizationScore += 4;
    }
    if (input.type.includes('growth') && (lowerResponse.includes('develop') || lowerResponse.includes('improve'))) {
        personalizationScore += 3;
    }
    
    analysis.contentAnalysis.personalizationScore = personalizationScore;
    
    // Calculate overall score
    analysis.overallScore = contentScore + emotionalScore + technicalScore + personalizationScore;
    
    // Generate improvement recommendations
    if (contentScore < 20) {
        analysis.improvements.push({
            area: 'Content Quality',
            issue: 'Response lacks depth and actionable advice',
            suggestion: 'Include more practical steps and detailed explanations'
        });
    }
    
    if (emotionalScore < 20) {
        analysis.improvements.push({
            area: 'Emotional Intelligence',
            issue: 'Limited empathy and emotional validation',
            suggestion: 'Add more empathetic language and direct emotional acknowledgment'
        });
    }
    
    if (technicalScore < 20) {
        analysis.improvements.push({
            area: 'Technical Execution',
            issue: 'Agent workflow not performing optimally',
            suggestion: 'Check agent coordination and response generation logic'
        });
    }
    
    if (personalizationScore < 20) {
        analysis.improvements.push({
            area: 'Personalization',
            issue: 'Response not well-tailored to specific user context',
            suggestion: 'Improve context awareness and scenario-specific responses'
        });
    }
    
    // Overall rating
    if (analysis.overallScore >= 95) analysis.rating = '🥇 WORLD-CLASS';
    else if (analysis.overallScore >= 85) analysis.rating = '🥈 EXCELLENT';
    else if (analysis.overallScore >= 75) analysis.rating = '🥉 GOOD';
    else if (analysis.overallScore >= 65) analysis.rating = '📈 NEEDS IMPROVEMENT';
    else analysis.rating = '🔧 MAJOR FIXES NEEDED';
    
    return analysis;
}

// Main testing function
async function runComprehensiveAnalysis() {
    try {
        console.log('🎲 Generating test scenario...');
        const testInput = generateTestInput();
        
        console.log(`📋 Test Type: ${testInput.type}`);
        console.log(`📝 Scenario: "${testInput.message.substring(0, 100)}..."`);
        console.log(`🎯 Expected Elements: ${testInput.expectedElements.join(', ')}`);
        console.log('\n⏳ Sending to AI system...\n');
        
        const { query } = await import('./utils/query.js');
        
        const startTime = Date.now();
        const response = await query(testInput.message, { 
            userId: 'comprehensive_test', 
            authToken: 'analysis_token' 
        });
        const endTime = Date.now();
        
        console.log('🎉 RESPONSE RECEIVED!');
        console.log('=' .repeat(60));
        
        const analysis = analyzeResponse(testInput, response, endTime - startTime);
        
        // Display results
        console.log(`⏱️  Response Time: ${analysis.responseTime}ms`);
        console.log(`📏 Response Length: ${analysis.basicMetrics.responseLength} characters`);
        console.log(`📝 Word Count: ${analysis.basicMetrics.wordCount} words`);
        console.log(`🤖 Agent Workflow: ${analysis.basicMetrics.hasAgentWorkflow ? '✅' : '❌'}`);
        
        console.log('\n📊 DETAILED SCORES:');
        console.log(`📄 Content Quality: ${analysis.contentAnalysis.score}/25`);
        console.log(`💝 Emotional Intelligence: ${analysis.emotionalIntelligence.score}/25`);
        console.log(`⚙️  Technical Capability: ${analysis.technicalCapability.score}/25`);
        console.log(`🎯 Personalization: ${analysis.contentAnalysis.personalizationScore}/25`);
        console.log(`\n🏆 OVERALL SCORE: ${analysis.overallScore}/100`);
        console.log(`🏅 RATING: ${analysis.rating}`);
        
        // Show actual response
        console.log('\n📤 AI RESPONSE:');
        console.log('─'.repeat(80));
        const responseText = response.combined_response || response.output_text || '';
        console.log(responseText);
        console.log('─'.repeat(80));
        
        // Show improvements
        if (analysis.improvements.length > 0) {
            console.log('\n💡 IMPROVEMENT RECOMMENDATIONS:');
            analysis.improvements.forEach((improvement, index) => {
                console.log(`${index + 1}. ${improvement.area}: ${improvement.issue}`);
                console.log(`   💡 ${improvement.suggestion}\n`);
            });
        }
        
        return analysis;
        
    } catch (error) {
        console.error('❌ ANALYSIS FAILED:', error.message);
        throw error;
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runComprehensiveAnalysis()
        .then(analysis => {
            console.log('\n✅ COMPREHENSIVE ANALYSIS COMPLETED');
            console.log(`🎯 Next step: Use these insights to improve prompts and workflows!`);
            
            if (analysis.overallScore < 95) {
                console.log(`📈 Target: Increase score from ${analysis.overallScore} to 95+ for world-class performance`);
            } else {
                console.log('🌟 CONGRATULATIONS! World-class performance achieved!');
            }
            
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Analysis failed:', error);
            process.exit(1);
        });
}

export { generateTestInput, analyzeResponse, runComprehensiveAnalysis };
