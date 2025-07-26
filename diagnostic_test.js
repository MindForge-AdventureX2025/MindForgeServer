// Simple diagnostic test to identify issues
console.log('🔍 DIAGNOSTIC TEST - Finding the issue');
console.log('=' .repeat(50));

async function diagnoseIssue() {
    try {
        // Step 1: Check if dotenv loads properly
        console.log('1️⃣ Testing dotenv...');
        const dotenv = await import('dotenv');
        dotenv.config();
        console.log('   ✅ Dotenv loaded');
        
        // Step 2: Check environment variables
        console.log('2️⃣ Checking environment...');
        console.log(`   API Key: ${process.env.MOONSHOT_API_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`   Base URL: ${process.env.MOONSHOT_BASE_URL || 'Default'}`);
        
        // Step 3: Try to import query function
        console.log('3️⃣ Importing query function...');
        const queryModule = await import('./utils/query.js');
        console.log('   ✅ Import successful');
        console.log(`   Available: ${Object.keys(queryModule).join(', ')}`);
        
        // Step 4: Test basic function existence
        console.log('4️⃣ Testing function availability...');
        if (typeof queryModule.query === 'function') {
            console.log('   ✅ query function is available');
        } else {
            console.log('   ❌ query function not found');
            return;
        }
        
        // Step 5: Test with very simple input and timeout
        console.log('5️⃣ Testing with simple input...');
        console.log('   Message: "Hi"');
        console.log('   Timeout: 15 seconds');
        
        const startTime = Date.now();
        
        try {
            const result = await Promise.race([
                queryModule.query("Hi", { userId: 'test', authToken: 'test' }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('15-second timeout')), 15000)
                )
            ]);
            
            const endTime = Date.now();
            
            console.log('   🎉 SUCCESS!');
            console.log(`   ⏱️  Time: ${endTime - startTime}ms`);
            console.log(`   📋 Type: ${typeof result}`);
            console.log(`   🔑 Keys: ${Object.keys(result || {}).join(', ')}`);
            
            const responseText = result?.combined_response || result?.output_text || result?.response || 'No text found';
            console.log(`   📝 Response preview: "${responseText.substring(0, 100)}..."`);
            
            return result;
            
        } catch (timeoutError) {
            console.log(`   ⏰ Timeout: ${timeoutError.message}`);
            console.log('   💡 The function is taking longer than 15 seconds');
            return null;
        }
        
    } catch (error) {
        console.log(`❌ Diagnostic failed at step: ${error.message}`);
        console.log('🔍 Full error:', error);
        return null;
    }
}

diagnoseIssue()
    .then(result => {
        if (result) {
            console.log('\n✅ DIAGNOSIS: System is working!');
            console.log('📋 Result received successfully');
        } else {
            console.log('\n⚠️ DIAGNOSIS: System has timeout or performance issues');
            console.log('💡 Consider checking API connectivity or agent performance');
        }
        process.exit(0);
    })
    .catch(error => {
        console.log('\n❌ DIAGNOSIS FAILED:', error);
        process.exit(1);
    });
