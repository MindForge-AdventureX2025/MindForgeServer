import { queryStream } from './utils/query.js';

// Performance test for queryStream function
class PerformanceTestResponse {
    constructor() {
        this.chunks = [];
        this.startTime = Date.now();
        this.phases = {
            streaming: null,
            workflow: null,
            total: null
        };
        this.status = {};
    }

    write(data) {
        const timestamp = Date.now() - this.startTime;
        this.chunks.push({ timestamp, data: data.trim() });
        
        // Track phase timings
        try {
            const jsonMatch = data.match(/data: (.+)/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1]);
                
                if (parsed.status === 'initial_response_complete') {
                    this.phases.streaming = timestamp;
                }
                if (parsed.status === 'workflow_complete' || parsed.status === 'workflow_error') {
                    this.phases.workflow = timestamp;
                }
                
                this.status[parsed.status] = timestamp;
            }
        } catch (e) {}
        
        console.log(`[${timestamp}ms] ${data.trim()}`);
    }

    end() {
        this.phases.total = Date.now() - this.startTime;
    }

    getPerformanceReport() {
        return {
            totalTime: this.phases.total || (Date.now() - this.startTime),
            streamingTime: this.phases.streaming,
            workflowTime: this.phases.workflow ? (this.phases.workflow - (this.phases.streaming || 0)) : null,
            totalChunks: this.chunks.length,
            statuses: Object.keys(this.status),
            hasError: this.chunks.some(c => c.data.includes('error')),
            hasWorkflow: this.chunks.some(c => c.data.includes('workflow')),
            hasAgents: this.chunks.some(c => c.data.includes('agent'))
        };
    }
}

// Comprehensive test scenarios
const testMessages = [
    {
        id: 'simple_emotion',
        message: "I feel really happy today because I got a promotion at work!",
        expectedTime: 20000,
        category: 'emotional'
    },
    {
        id: 'complex_analysis',
        message: "I've been struggling with anxiety about my future career path. Can you help me analyze my emotional patterns and suggest ways to improve my confidence?",
        expectedTime: 30000,
        category: 'complex'
    },
    {
        id: 'memory_integration',
        message: "Please remember that I prefer morning workouts and save this preference. Also, can you retrieve any previous fitness-related insights?",
        expectedTime: 25000,
        category: 'memory'
    }
];

async function runPerformanceTest() {
    console.log('🚀 QUERYSTREAM PERFORMANCE ANALYSIS');
    console.log('=' .repeat(60));
    console.log(`📅 Test Time: ${new Date().toLocaleString()}`);
    console.log(`🎯 Goal: Evaluate current performance and identify improvements\n`);

    const results = [];

    for (const test of testMessages) {
        console.log(`\n🧪 Test: ${test.id.toUpperCase()}`);
        console.log(`📝 Message: "${test.message}"`);
        console.log(`⏱️  Expected time: ${test.expectedTime/1000}s`);
        console.log(`🏷️  Category: ${test.category}`);
        console.log('─'.repeat(60));

        const mockRes = new PerformanceTestResponse();
        const timeout = test.expectedTime + 15000; // Add 15s buffer

        try {
            const testPromise = queryStream(test.message, mockRes, {
                userId: `perf_test_${test.id}`,
                authToken: 'test_token_perf'
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    mockRes.end();
                    reject(new Error(`Test timeout after ${timeout}ms`));
                }, timeout);
            });

            await Promise.race([testPromise, timeoutPromise]);

        } catch (error) {
            console.log(`⚠️ Test ended: ${error.message}`);
        }

        mockRes.end();
        const report = mockRes.getPerformanceReport();
        results.push({ testId: test.id, ...report, expectedTime: test.expectedTime });

        console.log(`\n📊 Performance Report for ${test.id}:`);
        console.log(`⏱️  Total time: ${report.totalTime}ms`);
        console.log(`🌊 Streaming time: ${report.streamingTime || 'N/A'}ms`);
        console.log(`🔄 Workflow time: ${report.workflowTime || 'N/A'}ms`);
        console.log(`📦 Total chunks: ${report.totalChunks}`);
        console.log(`✅ Success indicators: ${report.statuses.join(', ')}`);
        console.log(`❌ Has errors: ${report.hasError}`);
        console.log(`🤖 Has workflow: ${report.hasWorkflow}`);
        console.log(`👥 Has agents: ${report.hasAgents}`);

        // Performance score calculation
        let score = 0;
        if (!report.hasError) score += 30;
        if (report.totalTime <= test.expectedTime) score += 25;
        if (report.hasWorkflow) score += 20;
        if (report.hasAgents) score += 15;
        if (report.streamingTime && report.streamingTime < 10000) score += 10;

        console.log(`🎯 Performance Score: ${score}/100`);

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Generate comprehensive analysis
    return generateAnalysisReport(results);
}

function generateAnalysisReport(results) {
    console.log(`\n🏆 COMPREHENSIVE PERFORMANCE ANALYSIS`);
    console.log('=' .repeat(60));

    const avgTime = results.reduce((sum, r) => sum + r.totalTime, 0) / results.length;
    const successRate = results.filter(r => !r.hasError).length / results.length;
    const workflowRate = results.filter(r => r.hasWorkflow).length / results.length;
    
    console.log(`📊 Average Response Time: ${avgTime.toFixed(0)}ms`);
    console.log(`✅ Success Rate: ${(successRate * 100).toFixed(1)}%`);
    console.log(`🔄 Workflow Activation Rate: ${(workflowRate * 100).toFixed(1)}%`);

    // Calculate overall score
    let overallScore = 0;
    overallScore += (successRate * 30);
    overallScore += (avgTime < 20000 ? 25 : Math.max(0, 25 - ((avgTime - 20000) / 1000)));
    overallScore += (workflowRate * 25);
    overallScore += (results.every(r => r.hasAgents) ? 20 : 0);

    console.log(`\n🎯 OVERALL SCORE: ${overallScore.toFixed(1)}/100`);

    // Performance rating
    let rating = '';
    if (overallScore >= 90) rating = '🥇 WORLD-CLASS';
    else if (overallScore >= 80) rating = '🥈 EXCELLENT';
    else if (overallScore >= 70) rating = '🥉 GOOD';
    else if (overallScore >= 60) rating = '📈 NEEDS IMPROVEMENT';
    else rating = '🔧 REQUIRES MAJOR FIXES';

    console.log(`🏅 Performance Rating: ${rating}`);

    // Generate improvement recommendations
    const recommendations = [];
    
    if (avgTime > 25000) {
        recommendations.push('⚡ CRITICAL: Optimize response times - target <20s');
    }
    if (workflowRate < 0.8) {
        recommendations.push('🔄 IMPROVE: Agent workflow activation rate');
    }
    if (successRate < 0.9) {
        recommendations.push('🛠️ FIX: Error handling and stability');
    }
    if (results.some(r => !r.hasAgents)) {
        recommendations.push('👥 ENHANCE: Agent coordination and selection');
    }

    console.log(`\n💡 IMPROVEMENT RECOMMENDATIONS:`);
    if (recommendations.length === 0) {
        console.log('🎉 System performing at world-class level!');
    } else {
        recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    // Specific technical recommendations
    console.log(`\n🔧 TECHNICAL IMPROVEMENTS NEEDED:`);
    console.log('  1. Add timeout handling for LLM API calls');
    console.log('  2. Implement retry mechanisms with exponential backoff');
    console.log('  3. Optimize agent prompt lengths for faster processing');
    console.log('  4. Add response caching for common queries');
    console.log('  5. Implement parallel agent execution where possible');
    console.log('  6. Add health checks for external dependencies');
    console.log('  7. Optimize memory tool integration');
    console.log('  8. Implement smart agent selection based on query type');

    return {
        overallScore,
        rating,
        avgTime,
        successRate,
        workflowRate,
        recommendations,
        results
    };
}

// Run the performance test
console.log('Starting comprehensive performance analysis...\n');
runPerformanceTest()
    .then(analysis => {
        console.log('\n✅ Performance analysis completed!');
        console.log(`\n📋 SUMMARY: ${analysis.rating} (${analysis.overallScore.toFixed(1)}/100)`);
        
        if (analysis.overallScore < 90) {
            console.log('\n🚀 Ready for Phase 3: System Improvements');
        } else {
            console.log('\n🎯 System ready for world-class deployment!');
        }
    })
    .catch(error => {
        console.error('\n❌ Performance analysis failed:', error);
    });
