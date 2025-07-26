// Test with timeout for Windows
import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testing AI System with Timeout');
console.log('=' .repeat(50));

async function testWithTimeout() {
    const timeoutMs = 30000; // 30 seconds
    
    try {
        console.log('📋 Loading query function...');
        const { query } = await import('./utils/query.js');
        
        console.log('✅ Function loaded successfully');
        console.log('🔄 Running test with emotional scenario...');
        
        const testMessage = "I feel anxious about my presentation tomorrow. Help me calm down.";
        console.log(`📝 Input: "${testMessage}"`);
        console.log('⏳ Processing (max 30s)...\n');
        
        const startTime = Date.now();
        
        // Race between query and timeout
        const result = await Promise.race([
            query(testMessage, { userId: 'test_user_123', authToken: 'test_token' }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('TIMEOUT: Query took too long')), timeoutMs)
            )
        ]);
        
        const endTime = Date.now();
        
        // Analyze results
        console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log(`⏱️  Response Time: ${endTime - startTime}ms`);
        console.log(`📏 Response Length: ${(result.combined_response || result.output_text || '').length} chars`);
        console.log(`🤖 Agent Workflow Active: ${result.agent_workflow_result ? '✅' : '❌'}`);
        
        // Show response content
        console.log('\n📤 AI Response:');
        const responseText = result.combined_response || result.output_text || 'No response';
        console.log('─'.repeat(60));
        console.log(responseText.substring(0, 500));
        if (responseText.length > 500) {
            console.log('... (truncated)');
        }
        console.log('─'.repeat(60));
        
        // Performance assessment
        let performanceRating = '';
        if (endTime - startTime < 5000) performanceRating = '🚀 EXCELLENT';
        else if (endTime - startTime < 10000) performanceRating = '🟢 GOOD';
        else if (endTime - startTime < 20000) performanceRating = '🟡 ACCEPTABLE';
        else performanceRating = '🔴 SLOW';
        
        console.log(`\n🏆 Performance Rating: ${performanceRating}`);
        
        // Quick quality check
        const qualityScore = assessResponseQuality(responseText, testMessage);
        console.log(`📊 Quality Score: ${qualityScore}/100`);
        
        return {
            success: true,
            responseTime: endTime - startTime,
            responseLength: responseText.length,
            hasAgentWorkflow: !!result.agent_workflow_result,
            qualityScore,
            performanceRating
        };
        
    } catch (error) {
        console.error('❌ TEST FAILED:');
        console.error(`Error: ${error.message}`);
        
        if (error.message.includes('TIMEOUT')) {
            console.error('🕐 The query function took too long to respond');
            console.error('💡 Suggestion: Check API connectivity and agent performance');
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

function assessResponseQuality(response, input) {
    let score = 0;
    const lowerResponse = response.toLowerCase();
    const lowerInput = input.toLowerCase();
    
    // Basic response checks
    if (response.length > 100) score += 20;
    if (response.length > 200) score += 10;
    
    // Relevance to anxiety/presentation
    if (lowerResponse.includes('anxious') || lowerResponse.includes('anxiety')) score += 15;
    if (lowerResponse.includes('presentation') || lowerResponse.includes('present')) score += 15;
    if (lowerResponse.includes('calm') || lowerResponse.includes('relax')) score += 15;
    
    // Helpful content
    if (lowerResponse.includes('help') || lowerResponse.includes('support')) score += 10;
    if (lowerResponse.includes('breath') || lowerResponse.includes('practice')) score += 10;
    if (lowerResponse.includes('prepare') || lowerResponse.includes('confident')) score += 5;
    
    return Math.min(score, 100);
}

// Run the test
testWithTimeout()
    .then(result => {
        console.log('\n✅ Test sequence completed');
        console.log('📋 Final Results:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n💥 Unexpected error:', error);
        process.exit(1);
    });
