// Quick function test
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Quick Function Test');
console.log('=' .repeat(40));

console.log('📋 Environment Check:');
console.log(`MOONSHOT_API_KEY: ${process.env.MOONSHOT_API_KEY ? 'Set ✅' : 'Missing ❌'}`);
console.log(`MOONSHOT_BASE_URL: ${process.env.MOONSHOT_BASE_URL || 'Using default'}`);

async function testBasicFunctionality() {
    try {
        console.log('\n🔍 Testing query function import...');
        const { query } = await import('./utils/query.js');
        
        console.log('✅ Import successful');
        console.log('📝 Testing with minimal message...');
        
        const startTime = Date.now();
        const result = await query("Hello world", { userId: 'test', authToken: 'test' });
        const endTime = Date.now();
        
        console.log(`\n🎉 SUCCESS! Query completed in ${endTime - startTime}ms`);
        console.log('📊 Result structure:');
        console.log('  - Type:', typeof result);
        console.log('  - Keys:', Object.keys(result || {}));
        console.log('  - Output text length:', (result?.output_text || '').length);
        console.log('  - Combined response length:', (result?.combined_response || '').length);
        console.log('  - Has agent workflow:', !!result?.agent_workflow_result);
        
        console.log('\n📤 Sample output:');
        const sampleText = result?.combined_response || result?.output_text || 'No output';
        console.log('"' + sampleText.substring(0, 150) + '"');
        
        return result;
        
    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error('Error:', error.message);
        throw error;
    }
}

testBasicFunctionality()
    .then(() => {
        console.log('\n✅ Basic functionality test PASSED');
        process.exit(0);
    })
    .catch(() => {
        console.log('\n❌ Basic functionality test FAILED');
        process.exit(1);
    });
