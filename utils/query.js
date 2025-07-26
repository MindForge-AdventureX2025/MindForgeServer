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

// Agent name mapping for backend/logging (concise names to hide internal structure)
const agentDisplayNames = {
    supervisor: "coordinator",
    retrieval: "search",
    summarization: "summary", 
    emotion: "empathy",
    tags: "categorize",
    enhancement: "improve",
    memory: "context",
    report: "analyze",
    monitor: "track"
};

// Function to get display name for agent
function getAgentDisplayName(agentName) {
    return agentDisplayNames[agentName] || "processor";
}

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

    // RAG Memory API Tools
    async createMemory(memoryType, title, content, metadata = {}, tags = []) {
        try {
            const response = await this.axiosInstance.post('/api/rag', {
                memoryType,
                title,
                content,
                metadata,
                tags
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getUserMemories(memoryType = null, limit = 50, page = 1, sortBy = 'relevanceScore') {
        try {
            const params = { limit, page, sortBy };
            if (memoryType) params.memoryType = memoryType;
            
            const response = await this.axiosInstance.get('/api/rag', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getMemoryById(id) {
        try {
            const response = await this.axiosInstance.get(`/api/rag/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async updateMemory(id, updateData) {
        try {
            const response = await this.axiosInstance.put(`/api/rag/${id}`, updateData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async searchMemories(query, memoryType = null, tags = null, limit = 20, minRelevance = 0.3) {
        try {
            const params = { query, limit, minRelevance };
            if (memoryType) params.memoryType = memoryType;
            if (tags) params.tags = tags;
            
            const response = await this.axiosInstance.get('/api/rag/search', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getMemoriesByType(type, limit = 50, page = 1) {
        try {
            const response = await this.axiosInstance.get(`/api/rag/type/${type}`, {
                params: { limit, page }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async addTagsToMemory(id, tags) {
        try {
            const response = await this.axiosInstance.post(`/api/rag/${id}/tags`, { tags });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async removeTagsFromMemory(id, tags) {
        try {
            const response = await this.axiosInstance.delete(`/api/rag/${id}/tags`, { 
                data: { tags }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async deleteMemory(id, permanent = false) {
        try {
            const response = await this.axiosInstance.delete(`/api/rag/${id}`, {
                params: { permanent }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getMemoryStats() {
        try {
            const response = await this.axiosInstance.get('/api/rag/stats');
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
            
            // RAG Memory tools
            case 'create_memory':
                return await this.createMemory(params.memoryType, params.title, params.content, params.metadata, params.tags);
            case 'get_user_memories':
                return await this.getUserMemories(params.memoryType, params.limit, params.page, params.sortBy);
            case 'get_memory':
                return await this.getMemoryById(params.id);
            case 'update_memory':
                return await this.updateMemory(params.id, params.updateData);
            case 'search_memories':
                return await this.searchMemories(params.query, params.memoryType, params.tags, params.limit, params.minRelevance);
            case 'get_memories_by_type':
                return await this.getMemoriesByType(params.type, params.limit, params.page);
            case 'add_memory_tags':
                return await this.addTagsToMemory(params.id, params.tags);
            case 'remove_memory_tags':
                return await this.removeTagsFromMemory(params.id, params.tags);
            case 'delete_memory':
                return await this.deleteMemory(params.id, params.permanent);
            case 'get_memory_stats':
                return await this.getMemoryStats();
            
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
            ],
            memory_tools: [
                'create_memory',
                'get_user_memories',
                'get_memory',
                'update_memory',
                'search_memories',
                'get_memories_by_type',
                'add_memory_tags',
                'remove_memory_tags',
                'delete_memory',
                'get_memory_stats'
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
            delete_chat: "Delete a chat. Params: {id: string}",
            
            // Memory/RAG tools
            create_memory: "Create a new memory entry. Params: {memoryType: string, title: string, content: string, metadata?: object, tags?: string[]}",
            get_user_memories: "Get all user memories. Params: {memoryType?: string, limit?: number, page?: number, sortBy?: string}",
            get_memory: "Get a specific memory by ID. Params: {id: string}",
            update_memory: "Update an existing memory. Params: {id: string, updateData: object}",
            search_memories: "Search memories by query. Params: {query: string, memoryType?: string, tags?: string, limit?: number, minRelevance?: number}",
            get_memories_by_type: "Get memories by type. Params: {type: string, limit?: number, page?: number}",
            add_memory_tags: "Add tags to a memory. Params: {id: string, tags: string[]}",
            remove_memory_tags: "Remove tags from a memory. Params: {id: string, tags: string[]}",
            delete_memory: "Delete a memory. Params: {id: string, permanent?: boolean}",
            get_memory_stats: "Get memory statistics for user. Params: {}"
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
            chunk: '<start><processor>Coordinator</processor> analyzing request...</start>' 
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
                chunk: '<start><processor>Coordinator</processor> coordinating tasks...</start>' 
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
                    agent: getAgentDisplayName(selectedAgent),
                    chunk: `<start><processor>${getAgentDisplayName(selectedAgent)}</processor> processing task...</start>` 
                })}\n\n`);
                
                // Execute the selected agent
                const agentResponse = await runAgent(selectedAgent, `${agentContext}\n\nTask: ${agentTask}`, userContext);
                
                // Step 3: Monitor agent evaluates the response
                res.write(`data: ${JSON.stringify({ 
                    status: 'monitoring', 
                    chunk: '<start><processor>Quality Control</processor> evaluating response...</start>' 
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
                        agent: getAgentDisplayName(selectedAgent),
                        satisfaction: satisfactionScore,
                        chunk: '<complete>Task completed successfully</complete>' 
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

// Helper function to run individual agents with performance optimizations
async function runAgent(agentName, message, userContext = null) {
    const AGENT_TIMEOUT = 8000; // 8 seconds max per agent
    const MAX_RETRIES = 2;
    
    try {
        const agent = agents[agentName];
        if (!agent) {
            throw new Error(`Processor ${getAgentDisplayName(agentName)} not found`);
        }
        
        // Initialize backend tools if user context is provided
        if (userContext && !backendTools) {
            backendTools = new BackendTools();
            if (userContext.userId && userContext.authToken) {
                backendTools.setAuth(userContext.userId, userContext.authToken);
            }
        }
        
        // Load agent-specific prompts
        const agentPromptPath = join(__dirname, "..", "prompts", `${agentName}.md`);
        let agentPrompt;
        
        try {
            agentPrompt = await readFile(agentPromptPath, "utf-8");
        } catch (e) {
            agentPrompt = `You are a specialized ${getAgentDisplayName(agentName)} processor. Handle the following request according to your role.`;
        }

        // Add tool information to agent prompt (optimized)
        let enhancedPrompt = agentPrompt;
        if (backendTools) {
            const toolDescriptions = backendTools.getToolDescriptions();
            const availableTools = backendTools.getAvailableTools();
            
            enhancedPrompt += `\n\n## Available Tools:\n`;
            
            // Simplified tool list for faster processing
            enhancedPrompt += `**Journal**: create_journal, get_journal, search_journals, update_journal\n`;
            enhancedPrompt += `**Memory**: create_memory, search_memories, get_user_memories, update_memory\n`;
            enhancedPrompt += `**Chat**: create_chat, get_chat_history\n\n`;
            
            enhancedPrompt += `**Tool Usage**: \`\`\`json\n{"tool_call": {"tool": "tool_name", "params": {...}}}\`\`\`\n\n`;
        }
        
        // Implement retry mechanism with timeout and optimization
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const responsePromise = client.chat.completions.create({
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
                    temperature: 0.6, // Slightly lower for consistency
                    max_tokens: 500, // Optimized for faster response
                });

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`${getAgentDisplayName(agentName)} timeout after ${AGENT_TIMEOUT}ms`)), AGENT_TIMEOUT);
                });

                const response = await Promise.race([responsePromise, timeoutPromise]);
                let agentResponse = response.choices[0].message.content;
                
                // Quick tool execution (with timeout)
                if (backendTools && agentResponse.includes('"tool_call"')) {
                    try {
                        const toolCallMatch = agentResponse.match(/```json\s*(\{[\s\S]*?"tool_call"[\s\S]*?\})\s*```/);
                        if (toolCallMatch) {
                            const toolCallData = JSON.parse(toolCallMatch[1]);
                            if (toolCallData.tool_call) {
                                // Execute tool with timeout
                                const toolPromise = backendTools.executeTool(
                                    toolCallData.tool_call.tool, 
                                    toolCallData.tool_call.params
                                );
                                const toolTimeoutPromise = new Promise((_, reject) => {
                                    setTimeout(() => reject(new Error('Tool timeout')), 5000);
                                });
                                
                                const toolResult = await Promise.race([toolPromise, toolTimeoutPromise]);
                                
                                // Quick follow-up response
                                const followUpPromise = client.chat.completions.create({
                                    model: process.env.LLM || "kimi-k2-0711-preview",
                                    messages: [
                                        {
                                            role: "system",
                                            content: "Provide a brief response based on the tool result."
                                        },
                                        {
                                            role: "user",
                                            content: `Tool result: ${JSON.stringify(toolResult)}\n\nBrief response (max 50 words):`
                                        }
                                    ],
                                    temperature: 0.6,
                                    max_tokens: 200,
                                });
                                
                                const followUpTimeoutPromise = new Promise((_, reject) => {
                                    setTimeout(() => reject(new Error('Follow-up timeout')), 5000);
                                });
                                
                                const followUpResponse = await Promise.race([followUpPromise, followUpTimeoutPromise]);
                                agentResponse = followUpResponse.choices[0].message.content;
                            }
                        }
                    } catch (toolError) {
                        console.error(`Tool execution error for ${getAgentDisplayName(agentName)}:`, toolError);
                        // Continue with original response
                    }
                }
                
                // Wrap response in triple backticks for frontend formatting
                return `\`\`\`\n${agentResponse}\n\`\`\``;
                
            } catch (error) {
                console.error(`${getAgentDisplayName(agentName)} attempt ${attempt} failed:`, error.message);
                
                if (attempt === MAX_RETRIES) {
                    // Final attempt failed, return optimized fallback response
                    return `\`\`\`\n* I am experiencing technical difficulties\n* I am working to resolve this issue\n* Please try again\n\`\`\``;
                }
                
                // Quick retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, attempt * 500));
            }
        }
        
    } catch (error) {
        console.error(`Error running ${getAgentDisplayName(agentName)}:`, error);
        return `\`\`\`\n* I am encountering an error: ${error.message}\n* I am attempting recovery\n* Please try again\n\`\`\``;
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

export const query = async (message, userContext = null) => {
    try {
        // Step 1: Get initial LLM response (same logic as queryStream but without streaming)
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
        
        const initialResponse = response.choices[0].message.content;
        
        // Step 2: Execute agent workflow (same as queryStream but without streaming updates)
        let agentWorkflowResult = null;
        try {
            // Create a mock response object for agent workflow (without actual streaming)
            const mockRes = {
                write: () => {}, // No-op for non-streaming
                end: () => {}
            };
            
            agentWorkflowResult = await executeAgentWorkflow(message, mockRes, userContext);
        } catch (workflowError) {
            console.error("Agent workflow error in query:", workflowError);
            // Continue with initial response if workflow fails
        }
        
        // Step 3: Combine responses
        const finalResponse = {
            output_text: initialResponse,
            agent_workflow_result: agentWorkflowResult,
            combined_response: agentWorkflowResult || initialResponse
        };
        
        return finalResponse;
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
export { BackendTools, getAgentDisplayName };