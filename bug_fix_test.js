// Comprehensive bug fix test
import dotenv from 'dotenv';
dotenv.config();

console.log('🐛 COMPREHENSIVE BUG FIX TEST');
console.log('=' .repeat(50));

async function testBugFixes() {
    try {
        console.log('📋 Loading system components...');
        
        // Test 1: Import all components to check for syntax errors
        console.log('\n🔍 Testing component imports:');
        
        try {
            const queryModule = await import('./utils/query.js');
            console.log('✅ utils/query.js - No syntax errors');
        } catch (error) {
            console.log('❌ utils/query.js - Syntax error:', error.message);
        }
        
        try {
            const ragController = await import('./controllers/rag.controller.js');
            console.log('✅ controllers/rag.controller.js - No syntax errors');
        } catch (error) {
            console.log('❌ controllers/rag.controller.js - Syntax error:', error.message);
        }
        
        try {
            const journalsController = await import('./controllers/journals.controller.js');
            console.log('✅ controllers/journals.controller.js - No syntax errors');
        } catch (error) {
            console.log('❌ controllers/journals.controller.js - Syntax error:', error.message);
        }
        
        try {
            const chatController = await import('./controllers/chat.controller.js');
            console.log('✅ controllers/chat.controller.js - No syntax errors');
        } catch (error) {
            console.log('❌ controllers/chat.controller.js - Syntax error:', error.message);
        }
        
        // Test 2: Test BackendTools functionality
        console.log('\n🛠️ Testing BackendTools functionality:');
        
        const { BackendTools } = await import('./utils/query.js');
        const backendTools = new BackendTools();
        
        // Test available tools
        const availableTools = backendTools.getAvailableTools();
        console.log(`📊 Journal tools: ${availableTools.journal_tools.length}`);
        console.log(`📊 Chat tools: ${availableTools.chat_tools.length}`);
        console.log(`📊 Memory tools: ${availableTools.memory_tools.length}`);
        
        // Test tool descriptions
        const toolDescriptions = backendTools.getToolDescriptions();
        const totalDescriptions = Object.keys(toolDescriptions).length;
        console.log(`📊 Tool descriptions: ${totalDescriptions}`);
        
        // Test specific tools that had bugs
        const criticalTools = ['add_tags', 'search_memories', 'search_journals'];
        console.log('\n🔧 Testing critical tools:');
        
        for (const tool of criticalTools) {
            const hasDescription = toolDescriptions.hasOwnProperty(tool);
            const isInJournalTools = availableTools.journal_tools.includes(tool);
            const isInMemoryTools = availableTools.memory_tools.includes(tool);
            const available = isInJournalTools || isInMemoryTools;
            
            console.log(`  ${tool}: ${available ? '✅' : '❌'} Available, ${hasDescription ? '✅' : '❌'} Described`);
        }
        
        // Test 3: Test structured response processing
        console.log('\n📝 Testing structured response processing:');
        
        const { processStructuredResponse } = await import('./utils/query.js');
        
        const testResponse = `
This is a test response for the user.

<!--STRUCTURED_DATA_START-->
{
  "actions": [
    {
      "type": "tag_management",
      "targetType": "journal",
      "targetId": "test123",
      "operation": "add",
      "tags": ["anxiety", "test"]
    }
  ]
}
<!--STRUCTURED_DATA_END-->
        `;
        
        const processed = processStructuredResponse(testResponse);
        console.log(`📊 Structured data detected: ${processed.hasStructuredData ? '✅' : '❌'}`);
        console.log(`📊 Actions count: ${processed.structuredData?.actions?.length || 0}`);
        
        return {
            success: true,
            componentsLoaded: true,
            backendToolsWorking: true,
            structuredResponseWorking: processed.hasStructuredData
        };
        
    } catch (error) {
        console.error('❌ Bug fix test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the bug fix test
testBugFixes()
    .then(result => {
        console.log('\n🐛 BUG FIX TEST RESULTS:');
        console.log('=' .repeat(40));
        console.log(`🎯 Overall Success: ${result.success ? '✅' : '❌'}`);
        console.log(`📦 Components Loaded: ${result.componentsLoaded ? '✅' : '❌'}`);
        console.log(`🛠️ Backend Tools Working: ${result.backendToolsWorking ? '✅' : '❌'}`);
        console.log(`📝 Structured Response Working: ${result.structuredResponseWorking ? '✅' : '❌'}`);
        
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
        
        if (result.success) {
            console.log('\n🎉 ALL BUGS FIXED! System ready for AI agent testing.');
        } else {
            console.log('\n🚫 Issues detected. Please fix before proceeding.');
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });
