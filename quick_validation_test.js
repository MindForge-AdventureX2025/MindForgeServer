// Quick World-Class Validation Test
import dotenv from 'dotenv';
dotenv.config();

console.log('⚡ QUICK WORLD-CLASS VALIDATION TEST');
console.log('=' .repeat(50));

async function quickValidationTest() {
    try {
        console.log('📋 Loading optimized query system...');
        const { query } = await import('./utils/query.js');
        
        // Single focused test to validate optimizations
        const testInput = "I feel anxious about my upcoming work presentation. This happens every time I have to speak publicly. Can you help me understand this pattern?";
        
        console.log('📝 Test Input:', testInput);
        console.log('\n⏳ Processing with world-class prompts...');
        
        const startTime = Date.now();
        
        const result = await Promise.race([
            query(testInput, { userId: 'validation_test', authToken: 'test_token' }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout after 15 seconds')), 15000)
            )
        ]);
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        console.log(`\n✅ Test completed in ${processingTime}ms`);
        
        let response = '';
        let hasStructuredData = false;
        
        if (typeof result === 'object') {
            response = result.combined_response || result.output_text || JSON.stringify(result);
            hasStructuredData = response.includes('<!--STRUCTURED_DATA_START-->');
        } else {
            response = result;
            hasStructuredData = response.includes('<!--STRUCTURED_DATA_START-->');
        }
        
        console.log('\n📊 VALIDATION RESULTS:');
        console.log(`⏱️ Speed: ${processingTime < 10000 ? '✅ Fast' : '⚠️ Slow'} (${processingTime}ms)`);
        console.log(`📊 Backend Actions: ${hasStructuredData ? '✅ Present' : '❌ Missing'}`);
        console.log(`📝 Response Length: ${response.length} characters`);
        console.log(`🤖 Response Type: ${typeof result}`);
        
        // Quick quality check
        const responseLower = response.toLowerCase();
        const hasEmotion = responseLower.includes('anxiety') || responseLower.includes('anxious');
        const hasPattern = responseLower.includes('pattern') || responseLower.includes('every time');
        const hasSupport = responseLower.includes('help') || responseLower.includes('understand');
        
        console.log(`🎯 Emotional Recognition: ${hasEmotion ? '✅' : '❌'}`);
        console.log(`🔄 Pattern Recognition: ${hasPattern ? '✅' : '❌'}`);
        console.log(`💙 Supportive Response: ${hasSupport ? '✅' : '❌'}`);
        
        console.log('\n📝 SAMPLE RESPONSE (first 400 chars):');
        console.log('─'.repeat(50));
        console.log(response.substring(0, 400) + (response.length > 400 ? '...' : ''));
        console.log('─'.repeat(50));
        
        const qualityScore = [hasEmotion, hasPattern, hasSupport, hasStructuredData, processingTime < 10000]
            .filter(Boolean).length;
        
        console.log(`\n🌟 QUALITY SCORE: ${qualityScore}/5`);
        
        if (qualityScore >= 4) {
            console.log('🥇 WORLD-CLASS PERFORMANCE VALIDATED!');
        } else if (qualityScore >= 3) {
            console.log('🥈 GOOD PERFORMANCE - Minor tweaks needed');
        } else {
            console.log('🔧 NEEDS OPTIMIZATION');
        }
        
        return {
            success: true,
            processingTime,
            qualityScore,
            hasStructuredData,
            response
        };
        
    } catch (error) {
        console.error('❌ Validation test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run quick validation
quickValidationTest()
    .then(result => {
        console.log('\n🏁 VALIDATION COMPLETE');
        
        if (result.success) {
            console.log('✅ System is operational with optimizations');
            console.log(`📈 Performance: ${result.qualityScore}/5`);
            console.log(`⚡ Speed: ${result.processingTime}ms`);
            console.log(`🔄 Backend Integration: ${result.hasStructuredData ? 'Active' : 'Inactive'}`);
        } else {
            console.log('❌ System validation failed');
            console.log(`Error: ${result.error}`);
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
