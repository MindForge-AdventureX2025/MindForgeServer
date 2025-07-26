import { queryStream } from './utils/query.js';

// Simple test to debug the queryStream function
class SimpleTestResponse {
    constructor() {
        this.output = [];
    }
    
    write(data) {
        this.output.push(data);
        console.log('Response:', data.trim());
    }
    
    end() {
        console.log('Response ended');
    }
}

async function quickTest() {
    console.log('🧪 Quick QueryStream Test');
    console.log('========================');
    
    const mockRes = new SimpleTestResponse();
    const testMessage = "I feel happy today and want to remember this moment.";
    
    console.log(`Testing message: "${testMessage}"`);
    console.log('Starting queryStream...\n');
    
    try {
        const result = await queryStream(testMessage, mockRes, {
            userId: 'test_user',
            authToken: 'test_token'
        });
        
        console.log('\n✅ Test completed successfully!');
        console.log('Final result:', result);
        console.log('Total response chunks:', mockRes.output.length);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

quickTest();
