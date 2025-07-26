import { queryStream } from './utils/query.js';

// Quick test with optimized system
class QuickTestResponse {
    constructor() {
        this.chunks = [];
        this.startTime = Date.now();
    }

    write(data) {
        const elapsed = Date.now() - this.startTime;
        this.chunks.push({ time: elapsed, data: data.trim() });
        console.log(`[${elapsed}ms] ${data.trim()}`);
    }

    end() {
        console.log(`\n⏱️ Total time: ${Date.now() - this.startTime}ms`);
        console.log(`📦 Total chunks: ${this.chunks.length}`);
    }
}

async function quickOptimizedTest() {
    console.log('🚀 QUICK OPTIMIZED SYSTEM TEST');
    console.log('=' .repeat(50));
    
    const mockRes = new QuickTestResponse();
    const testMessage = "I feel anxious about my upcoming presentation tomorrow.";
    
    console.log(`📝 Testing: "${testMessage}"`);
    console.log('Starting optimized queryStream...\n');
    
    try {
        const result = await Promise.race([
            queryStream(testMessage, mockRes, {
                userId: 'quick_test',
                authToken: 'test_token'
            }),
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), 25000);
            })
        ]);
        
        mockRes.end();
        console.log('\n✅ Test completed successfully!');
        console.log('📊 Result length:', result?.length || 0);
        
        // Quick performance assessment
        const totalTime = Date.now() - mockRes.startTime;
        const hasWorkflow = mockRes.chunks.some(c => c.data.includes('workflow'));
        const hasAgents = mockRes.chunks.some(c => c.data.includes('agent'));
        const hasError = mockRes.chunks.some(c => c.data.includes('error'));
        
        console.log('\n📊 Performance Assessment:');
        console.log(`⏱️ Speed: ${totalTime < 20000 ? '✅' : '❌'} ${totalTime}ms (target: <20s)`);
        console.log(`🔄 Workflow: ${hasWorkflow ? '✅' : '❌'} Agent coordination`);
        console.log(`👥 Agents: ${hasAgents ? '✅' : '❌'} Agent involvement`);
        console.log(`🛠️ Stability: ${!hasError ? '✅' : '❌'} Error-free execution`);
        
        const score = (totalTime < 20000 ? 25 : 0) + 
                     (hasWorkflow ? 25 : 0) + 
                     (hasAgents ? 25 : 0) + 
                     (!hasError ? 25 : 0);
        
        console.log(`\n🎯 Quick Score: ${score}/100`);
        
        if (score >= 80) {
            console.log('🥈 EXCELLENT - Ready for full testing!');
        } else if (score >= 60) {
            console.log('📈 GOOD - Some optimizations working!');
        } else {
            console.log('🔧 NEEDS MORE WORK - Continue optimizing');
        }
        
    } catch (error) {
        mockRes.end();
        console.log(`\n❌ Test failed: ${error.message}`);
    }
}

quickOptimizedTest();
