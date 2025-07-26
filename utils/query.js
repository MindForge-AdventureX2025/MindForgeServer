import OpenAI from "openai";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import { 
    supervisor_agent, 
    retrieval_agent, 
    summarization_agent, 
    emotion_agent, 
    tags_agent, 
    enhancement_agent, 
    memory_agent, 
    report_agent, 
    monitor_agent 
} from "./agents.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OpenAI({
    apiKey: process.env.MOONSHOT_API_KEY,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.cn/v1"
});

// Use absolute path to avoid path resolution issues
const systemPromptPath = join(__dirname, "..", "prompts", "system.md");
const data = await readFile(systemPromptPath, "utf-8");

// Agent registry for dynamic selection
const agents = {
    supervisor: supervisor_agent,
    retrieval: retrieval_agent,
    summarization: summarization_agent,
    emotion: emotion_agent,
    tags: tags_agent,
    enhancement: enhancement_agent,
    memory: memory_agent,
    report: report_agent,
    monitor: monitor_agent
};

// Backend API Tools for AI Agents
class BackendTools {
    constructor(baseURL = `http://localhost:${process.env.PORT || 3000}`) {
        this.baseURL = baseURL;
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Set authentication headers for API calls
    setAuth(userId, authToken) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        this.axiosInstance.defaults.headers.common['X-User-ID'] = userId;
    }

    // Journal API Tools
    async createJournal(title = "untitled", content = "") {
        try {
            const response = await this.axiosInstance.post('/api/journals', { title, content });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getJournalById(id) {
        try {
            const response = await this.axiosInstance.get(`/api/journals/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getJournalHistory(limit = 10, page = 1) {
        try {
            const response = await this.axiosInstance.get('/api/journals', {
                params: { limit, page }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async updateJournal(id, title, content) {
        try {
            const response = await this.axiosInstance.put(`/api/journals/${id}`, { title, content });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async searchJournals(keyword, tags = '', from = null, to = null) {
        try {
            const params = { keyword };
            if (tags) params.tags = tags;
            if (from) params.from = from;
            if (to) params.to = to;
            
            const response = await this.axiosInstance.get('/api/journals/search', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async addTagsToJournal(id, tags) {
        try {
            const response = await this.axiosInstance.post('/api/journals/tags', { id, tags });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async removeTagsFromJournal(id, tags) {
        try {
            const response = await this.axiosInstance.delete('/api/journals/tags', { 
                data: { id, tags }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getJournalVersions(id, limit = 10, page = 1) {
        try {
            const response = await this.axiosInstance.get(`/api/journals/versions/${id}`, {
                params: { limit, page }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async setJournalVersion(id, versionId) {
        try {
            const response = await this.axiosInstance.post(`/api/journals/versions/${id}`, { versionId });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async renameJournal(id, name) {
        try {
            const response = await this.axiosInstance.post(`/api/journals/rename/${id}`, { name });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async deleteJournal(id) {
        try {
            const response = await this.axiosInstance.delete(`/api/journals/delete/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    // Chat API Tools
    async createChat() {
        try {
            const response = await this.axiosInstance.post('/api/chats');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getChatById(id) {
        try {
            const response = await this.axiosInstance.get(`/api/chats/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getChatHistory(limit = 10, page = 1) {
        try {
            const response = await this.axiosInstance.get('/api/chats', {
                params: { limit, page }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async updateChatName(id, name) {
        try {
            const response = await this.axiosInstance.post(`/api/chats/rename/${id}`, { name });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async deleteChat(id) {
        try {
            const response = await this.axiosInstance.delete(`/api/chats/delete/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    // Tool execution function for AI agents
    async executeTool(toolName, params) {
        switch (toolName) {
            // Journal tools
            case 'create_journal':
                return await this.createJournal(params.title, params.content);
            case 'get_journal':
                return await this.getJournalById(params.id);
            case 'get_journal_history':
                return await this.getJournalHistory(params.limit, params.page);
            case 'update_journal':
                return await this.updateJournal(params.id, params.title, params.content);
            case 'search_journals':
                return await this.searchJournals(params.keyword, params.tags, params.from, params.to);
            case 'add_tags':
                return await this.addTagsToJournal(params.id, params.tags);
            case 'remove_tags':
                return await this.removeTagsFromJournal(params.id, params.tags);
            case 'get_journal_versions':
                return await this.getJournalVersions(params.id, params.limit, params.page);
            case 'set_journal_version':
                return await this.setJournalVersion(params.id, params.versionId);
            case 'rename_journal':
                return await this.renameJournal(params.id, params.name);
            case 'delete_journal':
                return await this.deleteJournal(params.id);
            
            // Chat tools
            case 'create_chat':
                return await this.createChat();
            case 'get_chat':
                return await this.getChatById(params.id);
            case 'get_chat_history':
                return await this.getChatHistory(params.limit, params.page);
            case 'update_chat_name':
                return await this.updateChatName(params.id, params.name);
            case 'delete_chat':
                return await this.deleteChat(params.id);
            
            default:
                return { success: false, error: `Unknown tool: ${toolName}` };
        }
    }

    // Get available tools for agents
    getAvailableTools() {
        return {
            journal_tools: [
                'create_journal',
                'get_journal', 
                'get_journal_history',
                'update_journal',
                'search_journals',
                'add_tags',
                'remove_tags',
                'get_journal_versions',
                'set_journal_version',
                'rename_journal',
                'delete_journal'
            ],
            chat_tools: [
                'create_chat',
                'get_chat',
                'get_chat_history', 
                'update_chat_name',
                'delete_chat'
            ]
        };
    }

    // Tool descriptions for AI agents
    getToolDescriptions() {
        return {
            // Journal tools
            create_journal: "Create a new journal entry. Params: {title: string, content: string}",
            get_journal: "Get a specific journal by ID. Params: {id: string}",
            get_journal_history: "Get user's journal history. Params: {limit?: number, page?: number}",
            update_journal: "Update an existing journal. Params: {id: string, title: string, content: string}",
            search_journals: "Search journals by keyword and filters. Params: {keyword: string, tags?: string, from?: date, to?: date}",
            add_tags: "Add tags to a journal. Params: {id: string, tags: string[]}",
            remove_tags: "Remove tags from a journal. Params: {id: string, tags: string[]}",
            get_journal_versions: "Get version history of a journal. Params: {id: string, limit?: number, page?: number}",
            set_journal_version: "Restore a journal to a specific version. Params: {id: string, versionId: string}",
            rename_journal: "Rename a journal. Params: {id: string, name: string}",
            delete_journal: "Delete a journal. Params: {id: string}",
            
            // Chat tools
            create_chat: "Create a new chat session. Params: {}",
            get_chat: "Get a specific chat by ID. Params: {id: string}",
            get_chat_history: "Get user's chat history. Params: {limit?: number, page?: number}",
            update_chat_name: "Update chat name. Params: {id: string, name: string}",
            delete_chat: "Delete a chat. Params: {id: string}"
        };
    }
}

// Global backend tools instance
let backendTools = null;

// Agent workflow execution
async function executeAgentWorkflow(userMessage, res, userContext = null) {
    try {
        let currentMessage = userMessage;
        let workflowComplete = false;
        let iterationCount = 0;
        const maxIterations = 10; // Prevent infinite loops
        
        // Step 1: Start with supervisor agent
        res.write(`data: ${JSON.stringify({ 
            status: 'workflow_started', 
            chunk: '<start><agent>Supervisor agent</agent> analyzing request...</start>' 
        })}\n\n`);
        
        let supervisorResponse = await runAgent('supervisor', currentMessage, userContext);
        let supervisorData;
        
        try {
            // Try to parse supervisor response as JSON
            supervisorData = JSON.parse(supervisorResponse);
        } catch (e) {
            // If not JSON, treat as regular response and complete workflow
            return supervisorResponse;
        }
        
        // Step 2-4: Iterative agent coordination
        while (!workflowComplete && iterationCount < maxIterations) {
            iterationCount++;
            
            res.write(`data: ${JSON.stringify({ 
                status: 'iteration', 
                count: iterationCount,
                chunk: '<start><agent>Supervisor agent</agent> coordinating agents...</start>' 
            })}\n\n`);
            
            // Check if supervisor indicates completion
            if (supervisorData.status === 'complete') {
                workflowComplete = true;
                break;
            }
            
            // Step 2: Supervisor selects and tasks an agent
            if (supervisorData.agent && supervisorData.task) {
                const selectedAgent = supervisorData.agent;
                const agentTask = supervisorData.task;
                const agentContext = supervisorData.context || '';
                
                res.write(`data: ${JSON.stringify({ 
                    status: 'agent_selected', 
                    agent: selectedAgent,
                    chunk: `<start><agent>${selectedAgent} agent</agent> processing task...</start>` 
                })}\n\n`);
                
                // Execute the selected agent
                const agentResponse = await runAgent(selectedAgent, `${agentContext}\n\nTask: ${agentTask}`, userContext);
                
                // Step 3: Monitor agent evaluates the response
                res.write(`data: ${JSON.stringify({ 
                    status: 'monitoring', 
                    chunk: '<start><agent>Monitor agent</agent> evaluating response quality...</start>' 
                })}\n\n`);
                
                const monitorResponse = await runAgent('monitor', 
                    `Agent: ${selectedAgent}\nTask: ${agentTask}\nResponse: ${agentResponse}\n\nEvaluate this response and provide satisfaction index (1-10). If satisfaction < 7, provide improvement feedback.`,
                    userContext
                );
                
                let monitorData;
                let satisfactionScore = 10; // Default to passing
                
                try {
                    monitorData = JSON.parse(monitorResponse);
                    satisfactionScore = monitorData.satisfaction || 10;
                } catch (e) {
                    // If monitor response isn't JSON, try to extract satisfaction score
                    const satisfactionMatch = monitorResponse.match(/satisfaction[:\s]*(\d+)/i);
                    if (satisfactionMatch) {
                        satisfactionScore = parseInt(satisfactionMatch[1]);
                    }
                }
                
                // If monitor satisfaction is too low, retry with the same agent
                if (satisfactionScore < 7) {
                    res.write(`data: ${JSON.stringify({ 
                        status: 'retry_required', 
                        satisfaction: satisfactionScore,
                        chunk: '<start>Response quality insufficient, requesting improvement...</start>' 
                    })}\n\n`);
                    
                    const improvementFeedback = monitorData?.feedback || 'Please improve the response quality and completeness.';
                    const improvedResponse = await runAgent(selectedAgent, 
                        `${agentContext}\n\nTask: ${agentTask}\n\nPrevious Response: ${agentResponse}\n\nImprovement Needed: ${improvementFeedback}\n\nPlease provide an improved response.`,
                        userContext
                    );
                    
                    // Send improved response back to supervisor
                    supervisorResponse = await runAgent('supervisor', 
                        `Previous Plan: ${JSON.stringify(supervisorData)}\n\nAgent: ${selectedAgent}\nCompleted Task: ${agentTask}\nFinal Response: ${improvedResponse}\n\nEvaluate mission completion and decide next steps.`,
                        userContext
                    );
                } else {
                    // Step 4: Send successful response back to supervisor
                    res.write(`data: ${JSON.stringify({ 
                        status: 'agent_completed', 
                        agent: selectedAgent,
                        satisfaction: satisfactionScore,
                        chunk: '<complete>Agent task completed successfully</complete>' 
                    })}\n\n`);
                    
                    supervisorResponse = await runAgent('supervisor', 
                        `Previous Plan: ${JSON.stringify(supervisorData)}\n\nAgent: ${selectedAgent}\nCompleted Task: ${agentTask}\nResponse: ${agentResponse}\n\nEvaluate mission completion and decide next steps.`,
                        userContext
                    );
                }
                
                // Parse supervisor's next decision
                try {
                    supervisorData = JSON.parse(supervisorResponse);
                } catch (e) {
                    // If supervisor response isn't JSON, assume completion
                    workflowComplete = true;
                    break;
                }
            } else {
                // If supervisor doesn't provide proper agent/task, complete workflow
                workflowComplete = true;
            }
        }
        
        // Extract final response
        if (supervisorData && supervisorData.user_response) {
            return typeof supervisorData.user_response === 'string' ? 
                   supervisorData.user_response : 
                   supervisorData.user_response.content || JSON.stringify(supervisorData.user_response);
        }
        
        return supervisorResponse;
        
    } catch (error) {
        console.error("Error in agent workflow:", error);
        res.write(`data: ${JSON.stringify({ 
            status: 'error', 
            chunk: '<error>Workflow error occurred, falling back to direct response</error>' 
        })}\n\n`);
        
        // Fallback to direct LLM response
        return await directLLMResponse(userMessage);
    }
}

// Helper function to run individual agents
async function runAgent(agentName, message, userContext = null) {
    try {
        const agent = agents[agentName];
        if (!agent) {
            throw new Error(`Agent ${agentName} not found`);
        }
        
        // Initialize backend tools if user context is provided
        if (userContext && !backendTools) {
            backendTools = new BackendTools();
            if (userContext.userId && userContext.authToken) {
                backendTools.setAuth(userContext.userId, userContext.authToken);
            }
        }
        
        // For now, we'll simulate agent execution using direct LLM calls with agent-specific prompts
        // In a full implementation, this would use the actual agent framework
        const agentPromptPath = join(__dirname, "..", "prompts", `${agentName}.md`);
        let agentPrompt;
        
        try {
            agentPrompt = await readFile(agentPromptPath, "utf-8");
        } catch (e) {
            agentPrompt = `You are the ${agentName} agent. Process the following request according to your role.`;
        }

        // Add tool information to agent prompt
        let enhancedPrompt = agentPrompt;
        if (backendTools) {
            const toolDescriptions = backendTools.getToolDescriptions();
            const availableTools = backendTools.getAvailableTools();
            
            enhancedPrompt += `\n\n## Available Backend Tools\n\nYou have access to the following backend API tools:\n\n`;
            
            enhancedPrompt += `### Journal Tools:\n`;
            availableTools.journal_tools.forEach(tool => {
                enhancedPrompt += `- **${tool}**: ${toolDescriptions[tool]}\n`;
            });
            
            enhancedPrompt += `\n### Chat Tools:\n`;
            availableTools.chat_tools.forEach(tool => {
                enhancedPrompt += `- **${tool}**: ${toolDescriptions[tool]}\n`;
            });
            
            enhancedPrompt += `\n### Tool Usage Format:\nTo use a tool, include in your response:\n\`\`\`json\n{\n  "tool_call": {\n    "tool": "tool_name",\n    "params": {\n      "param1": "value1",\n      "param2": "value2"\n    }\n  }\n}\n\`\`\`\n\nThe tool execution result will be provided to you, and you can then formulate your response based on the data returned.\n\n`;
        }
        
        const response = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: enhancedPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
        });
        
        let agentResponse = response.choices[0].message.content;
        
        // Check if agent wants to use tools
        if (backendTools && agentResponse.includes('"tool_call"')) {
            try {
                // Extract tool call from response
                const toolCallMatch = agentResponse.match(/```json\s*(\{[\s\S]*?"tool_call"[\s\S]*?\})\s*```/);
                if (toolCallMatch) {
                    const toolCallData = JSON.parse(toolCallMatch[1]);
                    if (toolCallData.tool_call) {
                        const toolResult = await backendTools.executeTool(
                            toolCallData.tool_call.tool, 
                            toolCallData.tool_call.params
                        );
                        
                        // Send tool result back to agent for final response
                        const followUpResponse = await client.chat.completions.create({
                            model: process.env.LLM || "kimi-k2-0711-preview",
                            messages: [
                                {
                                    role: "system",
                                    content: enhancedPrompt
                                },
                                {
                                    role: "user",
                                    content: message
                                },
                                {
                                    role: "assistant", 
                                    content: agentResponse
                                },
                                {
                                    role: "user",
                                    content: `Tool execution result: ${JSON.stringify(toolResult)}\n\nPlease provide your final response based on this data.`
                                }
                            ],
                            temperature: 0.7,
                        });
                        
                        agentResponse = followUpResponse.choices[0].message.content;
                    }
                }
            } catch (toolError) {
                console.error(`Tool execution error for ${agentName}:`, toolError);
                // Continue with original response if tool execution fails
            }
        }
        
        // Wrap response in triple backticks for frontend formatting
        return `\`\`\`\n${agentResponse}\n\`\`\``;
        
    } catch (error) {
        console.error(`Error running agent ${agentName}:`, error);
        return `\`\`\`\nAgent ${agentName} encountered an error. Please try again.\n\`\`\``;
    }
}

// Direct LLM response for fallback
async function directLLMResponse(message) {
    const response = await client.chat.completions.create({
        model: process.env.LLM || "kimi-k2-0711-preview",
        messages: [
            {
                role: "system",
                content: data
            },
            {
                role: "user",
                content: message
            }
        ],
        temperature: 0.7,
    });
    
    return response.choices[0].message.content;
}

export const query = async (message) => {
    try {
        const response = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: data
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
        });
        return {
            output_text: response.choices[0].message.content
        };
    } catch (error) {
        console.error("Error in query function:", error);
        throw error;
    }
};

export const queryStream = async (message, res, userContext = null) => {
    try {
        let fullText = "";
        
        // First, provide the initial response via streaming
        res.write(`data: ${JSON.stringify({ 
            status: 'initial_response_start', 
            chunk: '<start>Generating initial response...</start>' 
        })}\n\n`);
        
        const stream = await client.chat.completions.create({
            model: process.env.LLM || "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: data
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            stream: true
        });

        for await (const chunk of stream) {
            const contentChunk = chunk.choices[0]?.delta?.content || '';
            fullText += contentChunk;
            res.write(`data: ${JSON.stringify({ chunk: contentChunk })}\n\n`);
        }

        // Signal completion of initial response
        res.write(`data: ${JSON.stringify({ 
            status: 'initial_response_complete',
            chunk: '<complete>Initial response completed.</complete> <start>Starting agent workflow...</start>' 
        })}\n\n`);

        // After initial response is complete, run the agent workflow
        try {
            const agentWorkflowResult = await executeAgentWorkflow(message, res, userContext);
            
            // Send the enhanced response from agent workflow
            res.write(`data: ${JSON.stringify({ 
                status: 'workflow_complete',
                enhanced_response: agentWorkflowResult,
                chunk: '<complete>Agent workflow completed successfully</complete>' 
            })}\n\n`);
            
            // Return the original response for now, enhanced response is sent via stream
            return fullText;
            
        } catch (workflowError) {
            console.error("Agent workflow error:", workflowError);
            res.write(`data: ${JSON.stringify({ 
                status: 'workflow_error',
                error: workflowError.message,
                chunk: '<error>Agent workflow encountered an error, using initial response</error>' 
            })}\n\n`);
            
            return fullText;
        }

    } catch (error) {
        console.error("Error in queryStream function:", error);
        res.write(`event: error\ndata: ${JSON.stringify({ chunk: error.message })}\n\n`);
        return "An error occurred while processing your request.";
    }
};

// Export BackendTools for external use
export { BackendTools };