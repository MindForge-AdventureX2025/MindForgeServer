// Debug test to check basic functionality
console.log('🔍 Debug Test Starting...');

try {
    console.log('1. Loading dotenv...');
    import('dotenv').then(dotenv => {
        dotenv.config();
        console.log('✅ Dotenv loaded');
    });

    console.log('2. Testing import...');
    import('./utils/query.js').then(module => {
        console.log('✅ Module imported successfully');
        console.log('📋 Available exports:', Object.keys(module));
        
        if (module.query) {
            console.log('✅ query function found');
            
            // Test basic function call
            console.log('3. Testing basic query call...');
            module.query("Hello, world!", { userId: 'debug_test', authToken: 'debug' })
                .then(result => {
                    console.log('✅ Query successful!');
                    console.log('📊 Result type:', typeof result);
                    console.log('🔍 Result keys:', Object.keys(result || {}));
                    console.log('📏 Response length:', (result?.combined_response || result?.output_text || '').length);
                    process.exit(0);
                })
                .catch(error => {
                    console.error('❌ Query failed:', error.message);
                    console.error('🔍 Error details:', error);
                    process.exit(1);
                });
        } else {
            console.error('❌ query function not found in exports');
            process.exit(1);
        }
    }).catch(error => {
        console.error('❌ Import failed:', error.message);
        console.error('🔍 Error details:', error);
        process.exit(1);
    });

} catch (error) {
    console.error('❌ Initial setup failed:', error.message);
    console.error('🔍 Error details:', error);
    process.exit(1);
}
