import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";
import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

// Direct agent tool test - bypassing the complex workflow
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

// Backend tools class (simplified)
class TestBackendTools {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'X-Test-Mode': 'true'
            }
        });
    }

    async executeTool(toolName, params) {
        console.log(`🛠️ EXECUTING TOOL: ${toolName}`);
        console.log(`📋 PARAMS:`, JSON.stringify(params, null, 2));
        
        switch (toolName) {
            case 'create_memory':
                try {
                    const response = await this.axiosInstance.post('/api/rag', {
                        memoryType: params.memoryType || 'topics_of_interest',
                        title: params.title,
                        content: params.content,
                        metadata: params.metadata || {},
                        tags: params.tags || []
                    });
                    console.log(`✅ MEMORY CREATED: ${response.data._id}`);
                    return { success: true, data: response.data };
                } catch (error) {
                    console.log(`❌ MEMORY CREATION FAILED: ${error.message}`);
                    return { success: false, error: error.message };
                }
            
            case 'create_journal':
                try {
                    const response = await this.axiosInstance.post('/api/journals', {
                        title: params.title,
                        content: params.content
                    });
                    console.log(`✅ JOURNAL CREATED: ${response.data._id}`);
                    return { success: true, data: response.data };
                } catch (error) {
                    console.log(`❌ JOURNAL CREATION FAILED: ${error.message}`);
                    return { success: false, error: error.message };
                }
                
            default:
                console.log(`❌ UNKNOWN TOOL: ${toolName}`);
                return { success: false, error: `Unknown tool: ${toolName}` };
        }
    }
}

async function testDirectAgentToolUsage() {
    console.log('🧪 DIRECT AGENT TOOL USAGE TEST');
    console.log('Testing individual agent with direct tool execution');
    console.log('=' .repeat(70));

    try {
        // Initialize backend tools
        const backendTools = new TestBackendTools();
        
        // Load memory agent prompt
        const memoryPromptPath = join(__dirname, "prompts", "memory_nextgen.md");
        let memoryPrompt;
        try {
            memoryPrompt = await readFile(memoryPromptPath, "utf-8");
        } catch (e) {
            memoryPrompt = "You are a memory agent specialized in creating and managing user memories.";
        }
        
        // Add explicit tool instructions
        const enhancedPrompt = memoryPrompt + `

## AVAILABLE TOOLS (YOU MUST USE THESE):

**Memory Creation Tools:**
- create_memory: Create a new memory entry. Params: {memoryType: string, title: string, content: string, metadata?: object, tags?: string[]}

**Memory Types:** user_preferences, behavioral_patterns, emotional_patterns, topics_of_interest, goals_and_aspirations, personal_insights, conversation_context

**CRITICAL INSTRUCTIONS:**
1. When you identify important information or patterns, YOU MUST use the create_memory tool
2. Format tool calls exactly like this: \`\`\`json
{"tool_call": {"tool": "create_memory", "params": {"memoryType": "topics_of_interest", "title": "Your Title", "content": "Your content", "tags": ["tag1", "tag2"]}}}
\`\`\`
3. Do not just describe what you would do - actually execute the tool call
4. Your primary value is in using these tools to make real changes to the user's memory database

**EXAMPLE TOOL USAGE:**
User: "I learned about React hooks today"
You should respond with: "I'll save this important learning for you." followed by:
\`\`\`json
{"tool_call": {"tool": "create_memory", "params": {"memoryType": "topics_of_interest", "title": "React Hooks Learning", "content": "User learned about React hooks and their importance in modern React development", "tags": ["react", "programming", "learning"]}}}
\`\`\`
`;

        console.log('\n📝 Testing memory creation with enhanced prompt...');
        
        const testMessage = `I just discovered an important productivity technique: the "Two-Minute Rule" - if a task takes less than two minutes, do it immediately instead of adding it to your to-do list. This prevents small tasks from accumulating and becoming overwhelming. This is a valuable behavioral insight I want to remember.`;
        
        console.log(`💬 User message: "${testMessage}"`);
        console.log('\n🤖 Calling memory agent with enhanced prompt...');
        
        // Call the LLM directly with enhanced prompt
        const response = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: enhancedPrompt
                },
                {
                    role: "user",
                    content: testMessage
                }
            ],
            temperature: 0.6,
            max_tokens: 1000,
        });
        
        const agentResponse = response.choices[0].message.content;
        console.log('\n📤 Agent Response:');
        console.log(agentResponse);
        
        // Check for tool call in response
        if (agentResponse.includes('tool_call')) {
            console.log('\n🎉 SUCCESS: Agent included tool_call in response!');
            
            // Extract and execute tool call
            const toolCallMatch = agentResponse.match(/json\\s*(\\{[\\s\\S]*?"tool_call"[\\s\\S]*?\\})\\s*/);
            if (toolCallMatch) {
                try {
                    const toolCallData = JSON.parse(toolCallMatch[1]);
                    if (toolCallData.tool_call) {
                        console.log('\\n🛠️ Executing tool call...');
                        const toolResult = await backendTools.executeTool(
                            toolCallData.tool_call.tool, 
                            toolCallData.tool_call.params
                        );
                        
                        console.log('\\n📊 Tool Execution Result:');
                        console.log(JSON.stringify(toolResult, null, 2));
                        
                        if (toolResult.success) {
                            console.log('\\n🎉 COMPLETE SUCCESS: Agent used tool and modified database!');
                            return true;
                        } else {
                            console.log('\\n❌ Tool execution failed');
                            return false;
                        }
                    }
                } catch (parseError) {
                    console.log('\\n❌ Failed to parse tool call:', parseError.message);
                    return false;
                }
            } else {
                console.log('\\n❌ Could not extract valid tool call from response');
                return false;
            }
        } else {
            console.log('\\n❌ FAILED: Agent did not include tool_call in response');
            console.log('\\n🔍 Checking if response mentions memory creation...');
            
            if (agentResponse.toLowerCase().includes('memory') || agentResponse.toLowerCase().includes('save') || agentResponse.toLowerCase().includes('store')) {
                console.log('✅ Agent mentions memory creation but did not use tool');
                console.log('⚠️ This indicates the agent understands the task but is not following tool usage instructions');
            } else {
                console.log('❌ Agent did not even mention memory creation');
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('💥 Direct agent test failed:', error.message);
        console.error('Stack trace:', error.stack);
        return false;
    }
}

// Run the direct test
testDirectAgentToolUsage().then(success => {
    console.log('\\n' + '=' .repeat(70));
    if (success) {
        console.log('🎉 DIRECT AGENT TOOL TEST: SUCCESS');
        console.log('✅ Agent can use tools and modify database');
    } else {
        console.log('❌ DIRECT AGENT TOOL TEST: FAILED');
        console.log('⚠️ Agent is not properly using tools to modify database');
    }
}).catch(error => {
    console.error('💥 Fatal error:', error);
});
