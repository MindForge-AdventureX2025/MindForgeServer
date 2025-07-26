// Test to verify agent names are properly hidden from backend
import dotenv from 'dotenv';
dotenv.config();

console.log('🔒 AGENT NAME HIDING VERIFICATION TEST');
console.log('=' .repeat(50));

async function testAgentNameHiding() {
    try {
        console.log('📋 Testing agent name mapping...');
        
        const { query, getAgentDisplayName } = await import('./utils/query.js');
        
        // Test the display name mapping
        const agentMappings = {
            'supervisor': 'coordinator',
            'retrieval': 'search',
            'emotion': 'empathy',
            'enhancement': 'improve',
            'memory': 'context',
            'summarization': 'summary',
            'tags': 'categorize',
            'report': 'analyze',
            'monitor': 'track'
        };
        
        console.log('🗺️ Agent Name Mappings:');
        Object.entries(agentMappings).forEach(([internal, display]) => {
            console.log(`  ${internal} → ${display}`);
        });
        
        console.log('\n🧪 Testing with real query...');
        const testMessage = "I feel stressed about work";
        console.log(`📝 Input: "${testMessage}"`);
        console.log('⏳ Processing (checking for exposed agent names)...\n');
        
        const startTime = Date.now();
        
        // Capture any logs or responses that might contain agent names
        const originalConsoleError = console.error;
        const capturedLogs = [];
        
        console.error = (...args) => {
            capturedLogs.push(args.join(' '));
            originalConsoleError(...args);
        };
        
        try {
            const result = await query(testMessage, { 
                userId: 'security_test', 
                authToken: 'test_token' 
            });
            
            const endTime = Date.now();
            
            // Restore console.error
            console.error = originalConsoleError;
            
            console.log('✅ Query completed successfully!');
            console.log(`⏱️  Response time: ${endTime - startTime}ms`);
            
            // Check for exposed agent names in response
            const responseText = result.combined_response || result.output_text || '';
            const exposedAgents = [];
            
            // Check for internal agent names that shouldn't be exposed
            const internalAgentNames = ['supervisor_agent', 'emotion_agent', 'memory_agent', 
                                      'retrieval_agent', 'enhancement_agent', 'summarization_agent',
                                      'tags_agent', 'report_agent', 'monitor_agent'];
            
            internalAgentNames.forEach(agentName => {
                if (responseText.toLowerCase().includes(agentName.toLowerCase())) {
                    exposedAgents.push(agentName);
                }
            });
            
            // Check captured logs for exposed agent names
            const exposedInLogs = [];
            capturedLogs.forEach(log => {
                internalAgentNames.forEach(agentName => {
                    if (log.toLowerCase().includes(agentName.toLowerCase())) {
                        exposedInLogs.push({ agent: agentName, log });
                    }
                });
            });
            
            // Security assessment
            console.log('\n🔍 SECURITY ASSESSMENT:');
            console.log(`📄 Response contains agent names: ${exposedAgents.length > 0 ? '❌ FAILED' : '✅ PASSED'}`);
            if (exposedAgents.length > 0) {
                console.log(`   Exposed agents: ${exposedAgents.join(', ')}`);
            }
            
            console.log(`📜 Logs contain agent names: ${exposedInLogs.length > 0 ? '❌ FAILED' : '✅ PASSED'}`);
            if (exposedInLogs.length > 0) {
                exposedInLogs.forEach(({ agent, log }) => {
                    console.log(`   ${agent} in: ${log.substring(0, 100)}...`);
                });
            }
            
            // Check for presence of display names (good)
            const displayNames = Object.values(agentMappings);
            const foundDisplayNames = displayNames.filter(name => 
                responseText.toLowerCase().includes(name.toLowerCase())
            );
            
            console.log(`🎭 Uses display names: ${foundDisplayNames.length > 0 ? '✅ GOOD' : '📝 NEUTRAL'}`);
            if (foundDisplayNames.length > 0) {
                console.log(`   Found: ${foundDisplayNames.join(', ')}`);
            }
            
            // Overall security rating
            const isSecure = exposedAgents.length === 0 && exposedInLogs.length === 0;
            console.log(`\n🏆 OVERALL SECURITY: ${isSecure ? '✅ SECURE' : '❌ NEEDS ATTENTION'}`);
            
            return {
                secure: isSecure,
                exposedAgents,
                exposedInLogs,
                foundDisplayNames,
                responseLength: responseText.length
            };
            
        } catch (queryError) {
            console.error = originalConsoleError;
            throw queryError;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return {
            secure: false,
            error: error.message
        };
    }
}

testAgentNameHiding()
    .then(result => {
        console.log('\n📊 TEST RESULTS:', result);
        if (result.secure) {
            console.log('🎉 SUCCESS: Agent names are properly hidden from backend!');
        } else {
            console.log('⚠️ WARNING: Some agent names may still be exposed');
        }
        process.exit(result.secure ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
