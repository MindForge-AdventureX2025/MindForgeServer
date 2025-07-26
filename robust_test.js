import { queryStream } from './utils/query.js';
import { EventEmitter } from 'events';

class TestResponse extends EventEmitter {
    constructor() {
        super();
        this.chunks = [];
        this.isComplete = false;
        this.startTime = Date.now();
    }

    write(data) {
        this.chunks.push({
            timestamp: Date.now() - this.startTime,
            data: data.trim()
        });
        
        console.log(`[${this.chunks.length}] ${data.trim()}`);
        
        // Check for completion
        if (data.includes('workflow_complete') || data.includes('error')) {
            this.isComplete = true;
            this.emit('complete');
        }
    }

    end() {
        this.isComplete = true;
        this.emit('complete');
    }

    getAnalysis() {
        return {
            totalChunks: this.chunks.length,
            totalTime: Date.now() - this.startTime,
            hasError: this.chunks.some(c => c.data.includes('error')),
            hasWorkflow: this.chunks.some(c => c.data.includes('workflow')),
            hasAgents: this.chunks.some(c => c.data.includes('agent')),
            chunks: this.chunks
        };
    }
}

// Test scenarios with varying complexity
const testCases = [
    {
        name: "Simple Emotional Entry",
        message: "I had a great day today! Feeling really positive.",
        expectedTime: 15000, // 15 seconds
        priority: 1
    },
    {
        name: "Complex Analysis Request", 
        message: "I've been feeling anxious lately about my career. Can you analyze my emotional patterns and help me understand what's causing this stress?",
        expectedTime: 25000, // 25 seconds
        priority: 2
    },
    {
        name: "Memory Integration Test",
        message: "Please save this insight: I work better in the mornings when I have coffee. Also, retrieve my previous productivity patterns.",
        expectedTime: 20000, // 20 seconds
        priority: 1
    }
];

async function runTestCase(testCase) {
    console.log(`\n🚀 Test: ${testCase.name}`);
    console.log(`📝 Message: "${testCase.message}"`);
    console.log(`⏱️  Expected time: ${testCase.expectedTime/1000}s`);
    console.log('─'.repeat(60));

    const mockRes = new TestResponse();
    const timeoutMs = testCase.expectedTime + 10000; // Add 10s buffer
    
    try {
        // Start the test with timeout
        const testPromise = queryStream(testCase.message, mockRes, {
            userId: `test_user_${Date.now()}`,
            authToken: 'test_token_123'
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Test timeout')), timeoutMs);
        });

        const completionPromise = new Promise((resolve) => {
            mockRes.on('complete', resolve);
        });

        // Race between completion and timeout
        await Promise.race([
            Promise.all([testPromise, completionPromise]),
            timeoutPromise
        ]);

        const analysis = mockRes.getAnalysis();
        
        console.log(`\n📊 Results for "${testCase.name}":`);
        console.log(`✅ Success: ${!analysis.hasError}`);
        console.log(`⏱️  Time: ${analysis.totalTime}ms`);
        console.log(`📦 Chunks: ${analysis.totalChunks}`);
        console.log(`🔄 Has workflow: ${analysis.hasWorkflow}`);
        console.log(`🤖 Has agents: ${analysis.hasAgents}`);

        // Rate the performance
        let score = 0;
        if (!analysis.hasError) score += 25;
        if (analysis.totalTime <= testCase.expectedTime) score += 25;
        if (analysis.hasWorkflow) score += 25;
        if (analysis.hasAgents) score += 25;

        console.log(`🎯 Score: ${score}/100`);

        return {
            testCase: testCase.name,
            success: !analysis.hasError,
            score: score,
            analysis: analysis
        };

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        return {
            testCase: testCase.name,
            success: false,
            score: 0,
            error: error.message,
            analysis: mockRes.getAnalysis()
        };
    }
}

async function runFullTestSuite() {
    console.log('🧪 MINDFORGE QUERYSTREAM TESTING SUITE');
    console.log('=' .repeat(60));
    console.log(`📅 ${new Date().toLocaleString()}`);
    
    const results = [];
    
    // Run priority 1 tests first (simpler)
    const priority1Tests = testCases.filter(t => t.priority === 1);
    console.log(`\n🔥 Running Priority 1 Tests (${priority1Tests.length})`);
    
    for (const testCase of priority1Tests) {
        const result = await runTestCase(testCase);
        results.push(result);
        
        // Short break between tests
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Analyze Priority 1 results before proceeding
    const p1Results = results.filter(r => testCases.find(t => t.name === r.testCase)?.priority === 1);
    const p1Success = p1Results.filter(r => r.success).length;
    const p1Average = p1Results.reduce((sum, r) => sum + r.score, 0) / p1Results.length;
    
    console.log(`\n📊 Priority 1 Summary: ${p1Success}/${p1Results.length} passed, Average: ${p1Average.toFixed(1)}/100`);
    
    if (p1Average < 60) {
        console.log('⚠️  Priority 1 tests show issues. Stopping before Priority 2.');
        return analyzeResults(results);
    }
    
    // Run priority 2 tests (more complex)
    const priority2Tests = testCases.filter(t => t.priority === 2);
    console.log(`\n🚀 Running Priority 2 Tests (${priority2Tests.length})`);
    
    for (const testCase of priority2Tests) {
        const result = await runTestCase(testCase);
        results.push(result);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return analyzeResults(results);
}

function analyzeResults(results) {
    console.log(`\n🏆 FINAL ANALYSIS`);
    console.log('=' .repeat(60));
    
    const successful = results.filter(r => r.success);
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / results.length;
    
    console.log(`📊 Tests: ${successful.length}/${results.length} passed`);
    console.log(`🎯 Average Score: ${averageScore.toFixed(1)}/100`);
    
    let rating = '';
    if (averageScore >= 90) rating = '🥇 WORLD-CLASS';
    else if (averageScore >= 80) rating = '🥈 EXCELLENT'; 
    else if (averageScore >= 70) rating = '🥉 GOOD';
    else if (averageScore >= 60) rating = '📈 NEEDS IMPROVEMENT';
    else rating = '🔧 REQUIRES MAJOR FIXES';
    
    console.log(`🏅 Rating: ${rating}`);
    
    // Identify issues
    console.log(`\n🔍 Issue Analysis:`);
    const issues = [];
    
    results.forEach(result => {
        if (!result.success) {
            issues.push(`❌ ${result.testCase}: ${result.error || 'Failed'}`);
        } else if (result.score < 75) {
            issues.push(`⚠️  ${result.testCase}: Score ${result.score}/100`);
        }
    });
    
    if (issues.length === 0) {
        console.log('✅ No major issues detected!');
    } else {
        issues.forEach(issue => console.log(issue));
    }
    
    return {
        results,
        averageScore,
        rating,
        issues,
        recommendations: generateRecommendations(results, averageScore)
    };
}

function generateRecommendations(results, averageScore) {
    const recommendations = [];
    
    if (averageScore < 90) {
        recommendations.push('🚀 Target for world-class ranking:');
        
        if (results.some(r => r.analysis?.totalTime > 15000)) {
            recommendations.push('  • Optimize response times - target <15s');
        }
        
        if (results.some(r => !r.analysis?.hasWorkflow)) {
            recommendations.push('  • Ensure agent workflow always activates');
        }
        
        if (results.some(r => !r.analysis?.hasAgents)) {
            recommendations.push('  • Improve agent coordination and selection');
        }
        
        if (results.some(r => r.analysis?.hasError)) {
            recommendations.push('  • Fix error handling and stability issues');
        }
    }
    
    return recommendations;
}

// Run the test suite
runFullTestSuite()
    .then(analysis => {
        console.log('\n✅ Testing completed successfully!');
        if (analysis.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            analysis.recommendations.forEach(rec => console.log(rec));
        }
    })
    .catch(error => {
        console.error('\n❌ Testing suite failed:', error);
    });
