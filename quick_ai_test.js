// Quick AI Agent Test for Analysis
import dotenv from 'dotenv';
dotenv.config();

console.log('⚡ QUICK AI AGENT ANALYSIS TEST');
console.log('=' .repeat(50));

async function quickAITest() {
    try {
        console.log('📋 Loading AI system...');
        const { query } = await import('./utils/query.js');
        
        console.log('🧪 Testing with simple input...');
        const testInput = "I wrote in my journal about feeling anxious before my presentation. Can you help me understand this pattern and add some tags to track it?";
        
        console.log(`📝 Input: "${testInput}"`);
        console.log('⏳ Processing...');
        
        const startTime = Date.now();
        
        const result = await query(testInput, {
            userId: 'quick_test_user',
            authToken: 'test_token'
        });
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        console.log(`✅ Completed in ${processingTime}ms`);
        
        let response = '';
        if (typeof result === 'object') {
            response = result.combined_response || result.output_text || JSON.stringify(result);
            console.log('📊 Result type: Object (Enhanced structure)');
            if (result.agent_workflow_result) {
                console.log('🔄 Agent workflow was used');
            }
        } else {
            response = result;
            console.log('📊 Result type: String (Direct response)');
        }
        
        // Check for structured data
        const hasStructuredData = response.includes('<!--STRUCTURED_DATA_START-->');
        if (hasStructuredData) {
            console.log('📊 Structured data detected: ✅');
            const structuredMatch = response.match(/<!--STRUCTURED_DATA_START-->([\s\S]*?)<!--STRUCTURED_DATA_END-->/);
            if (structuredMatch) {
                try {
                    const structuredData = JSON.parse(structuredMatch[1]);
                    console.log(`📊 Actions found: ${structuredData.actions?.length || 0}`);
                } catch (e) {
                    console.log('⚠️ Structured data parsing failed');
                }
            }
        } else {
            console.log('📊 Structured data detected: ❌');
        }
        
        console.log('\n📝 RESPONSE ANALYSIS:');
        console.log(`📏 Length: ${response.length} characters`);
        console.log(`🎯 Contains "anxiety": ${response.toLowerCase().includes('anxiety') ? '✅' : '❌'}`);
        console.log(`🏷️ Contains "tags": ${response.toLowerCase().includes('tag') ? '✅' : '❌'}`);
        console.log(`📊 Contains "pattern": ${response.toLowerCase().includes('pattern') ? '✅' : '❌'}`);
        console.log(`💡 Contains insights: ${response.toLowerCase().includes('insight') || response.toLowerCase().includes('understand') ? '✅' : '❌'}`);
        
        console.log('\n📝 SAMPLE RESPONSE (First 500 chars):');
        console.log('─'.repeat(60));
        console.log(response.substring(0, 500));
        if (response.length > 500) {
            console.log('\n... (truncated)');
        }
        console.log('─'.repeat(60));
        
        return {
            success: true,
            processingTime,
            responseLength: response.length,
            hasStructuredData,
            response
        };
        
    } catch (error) {
        console.error('❌ Quick test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

quickAITest()
    .then(result => {
        console.log('\n⚡ QUICK TEST RESULTS:');
        console.log('=' .repeat(40));
        console.log(`🎯 Success: ${result.success ? '✅' : '❌'}`);
        
        if (result.success) {
            console.log(`⏱️ Processing Time: ${result.processingTime}ms`);
            console.log(`📏 Response Length: ${result.responseLength} chars`);
            console.log(`📊 Structured Data: ${result.hasStructuredData ? '✅' : '❌'}`);
            
            // Performance evaluation
            if (result.processingTime < 5000) {
                console.log('🚀 Performance: Excellent (< 5s)');
            } else if (result.processingTime < 10000) {
                console.log('👍 Performance: Good (< 10s)');
            } else {
                console.log('⚠️ Performance: Needs optimization (> 10s)');
            }
            
            // Response quality evaluation
            if (result.responseLength > 200 && result.responseLength < 2000) {
                console.log('📝 Response Length: Optimal');
            } else if (result.responseLength <= 200) {
                console.log('📝 Response Length: Too short');
            } else {
                console.log('📝 Response Length: Too long');
            }
        }
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
        
        console.log('\n🎯 ANALYSIS READY FOR OPTIMIZATION!');
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
