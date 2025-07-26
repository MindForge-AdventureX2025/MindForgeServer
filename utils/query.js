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
                'Content-Type': 'application/json',
                'x-test-mode': 'true' // Enable test mode for internal tool calls
            }
        });
    }

    // Set authentication headers for API calls
    setAuth(userId, authToken) {
        // For internal tool calls, we override the test user with actual user data
        this.axiosInstance.defaults.headers.common['x-test-mode'] = 'true';
        this.axiosInstance.defaults.headers.common['x-user-id'] = userId;
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

    async addTagsToJournal(journalId, tags) {
        try {
            const response = await this.axiosInstance.post('/api/journals/tags', { journalId, tags });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async removeTagsFromJournal(journalId, tags) {
        try {
            const response = await this.axiosInstance.delete('/api/journals/tags', { 
                data: { journalId, tags }
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

    // Enhanced Journal Tools
    async searchChatHistory(keyword, limit = 20, page = 1, dateFrom = null, dateTo = null) {
        try {
            const params = { keyword, limit, page };
            if (dateFrom) params.from = dateFrom;
            if (dateTo) params.to = dateTo;
            
            const response = await this.axiosInstance.get('/api/chats/search', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getMultipleJournals(journalIds) {
        try {
            const response = await this.axiosInstance.post('/api/journals/bulk', { ids: journalIds });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async partialUpdateJournal(id, selectedText, newText, operation = 'replace') {
        try {
            const response = await this.axiosInstance.patch(`/api/journals/${id}/partial`, {
                selectedText,
                newText,
                operation // 'replace', 'insert_before', 'insert_after', 'append', 'prepend'
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async bulkUpdateJournals(updates) {
        try {
            // updates: [{ id, selectedText?, newText?, operation? }]
            const response = await this.axiosInstance.patch('/api/journals/bulk-update', { updates });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async analyzeJournalPatterns(journalIds, analysisType = 'mood') {
        try {
            const response = await this.axiosInstance.post('/api/journals/analyze', {
                journalIds,
                analysisType // 'mood', 'themes', 'progress', 'sentiment'
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getJournalsByDateRange(startDate, endDate, tags = null) {
        try {
            const params = { startDate, endDate };
            if (tags) params.tags = tags;
            
            const response = await this.axiosInstance.get('/api/journals/date-range', { params });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async createJournalTemplate(name, structure, defaultContent = '') {
        try {
            const response = await this.axiosInstance.post('/api/journals/templates', {
                name,
                structure,
                defaultContent
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    }

    async getJournalTemplates() {
        try {
            const response = await this.axiosInstance.get('/api/journals/templates');
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
                return await this.addTagsToJournal(params.journalId, params.tags);
            case 'remove_tags':
                return await this.removeTagsFromJournal(params.journalId, params.tags);
            case 'get_journal_versions':
                return await this.getJournalVersions(params.id, params.limit, params.page);
            case 'set_journal_version':
                return await this.setJournalVersion(params.id, params.versionId);
            case 'rename_journal':
                return await this.renameJournal(params.id, params.name);
            case 'delete_journal':
                return await this.deleteJournal(params.id);
            
            // Enhanced Journal tools
            case 'get_multiple_journals':
                return await this.getMultipleJournals(params.journalIds);
            case 'partial_update_journal':
                return await this.partialUpdateJournal(params.id, params.selectedText, params.newText, params.operation);
            case 'bulk_update_journals':
                return await this.bulkUpdateJournals(params.updates);
            case 'analyze_journal_patterns':
                return await this.analyzeJournalPatterns(params.journalIds, params.analysisType);
            case 'get_journals_by_date_range':
                return await this.getJournalsByDateRange(params.startDate, params.endDate, params.tags);
            case 'create_journal_template':
                return await this.createJournalTemplate(params.name, params.structure, params.defaultContent);
            case 'get_journal_templates':
                return await this.getJournalTemplates();
            
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
            case 'search_chat_history':
                return await this.searchChatHistory(params.keyword, params.limit, params.page, params.dateFrom, params.dateTo);
            
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
                'delete_journal',
                'get_multiple_journals',
                'partial_update_journal',
                'bulk_update_journals',
                'analyze_journal_patterns',
                'get_journals_by_date_range',
                'create_journal_template',
                'get_journal_templates'
            ],
            chat_tools: [
                'create_chat',
                'get_chat',
                'get_chat_history', 
                'update_chat_name',
                'delete_chat',
                'search_chat_history'
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
            add_tags: "Add tags to a journal. Params: {journalId: string, tags: string[]}",
            remove_tags: "Remove tags from a journal. Params: {journalId: string, tags: string[]}",
            get_journal_versions: "Get version history of a journal. Params: {id: string, limit?: number, page?: number}",
            set_journal_version: "Restore a journal to a specific version. Params: {id: string, versionId: string}",
            rename_journal: "Rename a journal. Params: {id: string, name: string}",
            delete_journal: "Delete a journal. Params: {id: string}",
            
            // Enhanced Journal tools
            get_multiple_journals: "Get multiple journals by IDs. Params: {journalIds: string[]}",
            partial_update_journal: "Update specific text in a journal. Params: {id: string, selectedText: string, newText: string, operation?: 'replace'|'insert_before'|'insert_after'|'append'|'prepend'}",
            bulk_update_journals: "Update multiple journals at once. Params: {updates: [{id: string, selectedText?: string, newText?: string, operation?: string}]}",
            analyze_journal_patterns: "Analyze patterns in journals. Params: {journalIds: string[], analysisType?: 'mood'|'themes'|'progress'|'sentiment'}",
            get_journals_by_date_range: "Get journals within date range. Params: {startDate: string, endDate: string, tags?: string}",
            create_journal_template: "Create a journal template. Params: {name: string, structure: object, defaultContent?: string}",
            get_journal_templates: "Get available journal templates. Params: {}",
            
            // Chat tools
            create_chat: "Create a new chat session. Params: {}",
            get_chat: "Get a specific chat by ID. Params: {id: string}",
            get_chat_history: "Get user's chat history. Params: {limit?: number, page?: number}",
            update_chat_name: "Update chat name. Params: {id: string, name: string}",
            delete_chat: "Delete a chat. Params: {id: string}",
            search_chat_history: "Search chat history by keyword. Params: {keyword: string, limit?: number, page?: number, dateFrom?: string, dateTo?: string}",
            
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

// Process structured agent response for backend actions
function processStructuredResponse(agentResponse) {
    try {
        // Clean up backticks around tags in the response
        let cleanedResponse = agentResponse;
        // Remove backticks around hashtags: `#tag` → #tag (including hyphens and underscores)
        cleanedResponse = cleanedResponse.replace(/`(#[\w-]+)`/g, '$1');
        // Remove quotes around hashtags: '#tag' → #tag (including hyphens and underscores)
        cleanedResponse = cleanedResponse.replace(/'(#[\w-]+)'/g, '$1');
        
        // Look for structured data markers in the response
        const structuredDataMatch = cleanedResponse.match(/\<\!--STRUCTURED_DATA_START\--\>([\s\S]*?)\<\!--STRUCTURED_DATA_END\--\>/);
        
        if (structuredDataMatch) {
            const structuredData = JSON.parse(structuredDataMatch[1]);
            const userResponse = cleanedResponse.replace(structuredDataMatch[0], '').trim();
            
            return {
                userResponse: userResponse,
                structuredData: structuredData,
                hasStructuredData: true
            };
        }
        
        return {
            userResponse: cleanedResponse,
            structuredData: null,
            hasStructuredData: false
        };
    } catch (error) {
        console.error('Error processing structured response:', error);
        return {
            userResponse: agentResponse,
            structuredData: null,
            hasStructuredData: false
        };
    }
}

// Execute backend actions based on structured data
async function executeBackendActions(structuredData, userContext) {
    if (!structuredData || !structuredData.actions) {
        return { success: true, results: [] };
    }
    
    const results = [];
    
    for (const action of structuredData.actions) {
        try {
            switch (action.type) {
                case 'journal_update':
                    if (action.journalId && action.selectedText && action.newText) {
                        const result = await backendTools.partialUpdateJournal(
                            action.journalId,
                            action.selectedText,
                            action.newText,
                            action.operation || 'replace'
                        );
                        results.push({
                            action: 'journal_update',
                            journalId: action.journalId,
                            success: result.success,
                            result: result
                        });
                    }
                    break;
                    
                case 'bulk_journal_update':
                    if (action.updates && Array.isArray(action.updates)) {
                        const result = await backendTools.bulkUpdateJournals(action.updates);
                        results.push({
                            action: 'bulk_journal_update',
                            count: action.updates.length,
                            success: result.success,
                            result: result
                        });
                    }
                    break;
                    
                case 'journal_analysis':
                    if (action.journalIds && Array.isArray(action.journalIds)) {
                        const result = await backendTools.analyzeJournalPatterns(
                            action.journalIds,
                            action.analysisType || 'mood'
                        );
                        results.push({
                            action: 'journal_analysis',
                            journalIds: action.journalIds,
                            analysisType: action.analysisType,
                            success: result.success,
                            result: result
                        });
                    }
                    break;
                    
                case 'memory_creation':
                    if (action.memoryData) {
                        const result = await backendTools.createMemory(
                            action.memoryData.memoryType,
                            action.memoryData.title,
                            action.memoryData.content,
                            action.memoryData.metadata || {},
                            action.memoryData.tags || []
                        );
                        results.push({
                            action: 'memory_creation',
                            success: result.success,
                            result: result
                        });
                    }
                    break;
                    
                case 'tag_management':
                    if (action.targetType === 'journal' && action.targetId) {
                        let result;
                        if (action.operation === 'add') {
                            result = await backendTools.addTagsToJournal(action.targetId, action.tags);
                        } else if (action.operation === 'remove') {
                            result = await backendTools.removeTagsFromJournal(action.targetId, action.tags);
                        }
                        
                        if (result) {
                            results.push({
                                action: 'tag_management',
                                targetType: action.targetType,
                                targetId: action.targetId,
                                operation: action.operation,
                                tags: action.tags,
                                success: result.success,
                                result: result
                            });
                        }
                    }
                    break;
                    
                default:
                    console.warn(`Unknown action type: ${action.type}`);
            }
        } catch (error) {
            console.error(`Error executing action ${action.type}:`, error);
            results.push({
                action: action.type,
                success: false,
                error: error.message
            });
        }
    }
    
    return {
        success: true,
        results: results,
        executedActions: results.length
    };
}

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
                
                // Extract user response and action results
                let displayResponse = agentResponse;
                let actionResults = null;
                
                if (typeof agentResponse === 'object' && agentResponse.userResponse) {
                    displayResponse = agentResponse.userResponse;
                    actionResults = agentResponse.actionResults;
                    
                    // Log action results for internal tracking (not shown to user)
                    if (actionResults && actionResults.executedActions > 0) {
                        console.log(`Executed ${actionResults.executedActions} backend actions for ${getAgentDisplayName(selectedAgent)}`);
                    }
                }
                
                // Step 3: Monitor agent evaluates the response
                res.write(`data: ${JSON.stringify({ 
                    status: 'monitoring', 
                    chunk: '<start><processor>Quality Control</processor> evaluating response...</start>' 
                })}\n\n`);
                
                const monitorResponse = await runAgent('monitor', 
                    `Agent: ${selectedAgent}\nTask: ${agentTask}\nResponse: ${displayResponse}\n\nEvaluate this response and provide satisfaction index (1-10). If satisfaction < 7, provide improvement feedback.`,
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
                        `${agentContext}\n\nTask: ${agentTask}\n\nPrevious Response: ${displayResponse}\n\nImprovement Needed: ${improvementFeedback}\n\nPlease provide an improved response.`,
                        userContext
                    );
                    
                    // Extract improved response if it's an object
                    let finalImprovedResponse = improvedResponse;
                    if (typeof improvedResponse === 'object' && improvedResponse.userResponse) {
                        finalImprovedResponse = improvedResponse.userResponse;
                        // Execute any additional actions from the improvement
                        if (improvedResponse.actionResults && improvedResponse.actionResults.executedActions > 0) {
                            console.log(`Executed ${improvedResponse.actionResults.executedActions} additional backend actions during improvement`);
                        }
                    }
                    
                    // Send improved response back to supervisor
                    supervisorResponse = await runAgent('supervisor', 
                        `Previous Plan: ${JSON.stringify(supervisorData)}\n\nAgent: ${selectedAgent}\nCompleted Task: ${agentTask}\nFinal Response: ${finalImprovedResponse}\n\nEvaluate mission completion and decide next steps.`,
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
                        `Previous Plan: ${JSON.stringify(supervisorData)}\n\nAgent: ${selectedAgent}\nCompleted Task: ${agentTask}\nResponse: ${displayResponse}\n\nEvaluate mission completion and decide next steps.`,
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
        
        // Ensure backendTools is always available for tool execution
        if (!backendTools) {
            backendTools = new BackendTools();
            console.log("⚠️ Creating backendTools without authentication context");
        }
        
        // Load agent-specific prompts (next-generation optimization)
        const nextGenPrompts = {
            'supervisor': 'supervisor_nextgen.md',
            'tags': 'tags_nextgen.md', 
            'emotion': 'emotion_nextgen.md',
            'memory': 'memory_nextgen.md'
        };
        
        const worldClassPrompts = {
            'supervisor': 'supervisor_worldclass.md',
            'tags': 'tags_worldclass.md', 
            'emotion': 'emotion_worldclass.md',
            'memory': 'memory_worldclass.md'
        };
        
        const promptFileName = nextGenPrompts[agentName] || worldClassPrompts[agentName] || `${agentName}.md`;
        const agentPromptPath = join(__dirname, "..", "prompts", promptFileName);
        let agentPrompt;
        
        try {
            agentPrompt = await readFile(agentPromptPath, "utf-8");
        } catch (e) {
            // Fallback to original prompt if world-class version doesn't exist
            const fallbackPromptPath = join(__dirname, "..", "prompts", `${agentName}.md`);
            try {
                agentPrompt = await readFile(fallbackPromptPath, "utf-8");
            } catch (fallbackError) {
                agentPrompt = `You are a specialized ${getAgentDisplayName(agentName)} processor. Handle the following request according to your role.`;
            }
        }

        // Add tool information to agent prompt (agent-specific tools)
        let enhancedPrompt = agentPrompt;
        if (backendTools) {
            const toolDescriptions = backendTools.getToolDescriptions();
            const availableTools = backendTools.getAvailableTools();
            
            enhancedPrompt += `\n\n## Available Tools for ${agentName}:\n`;
            
            // Agent-specific tool assignments
            if (agentName === 'tags') {
                enhancedPrompt += `**Tags Management Tools (EXECUTE THESE IMMEDIATELY):**\n`;
                enhancedPrompt += `- add_tags: ${toolDescriptions.add_tags}\n`;
                enhancedPrompt += `- remove_tags: ${toolDescriptions.remove_tags}\n`;
                enhancedPrompt += `- search_journals: ${toolDescriptions.search_journals}\n`;
                enhancedPrompt += `- get_journal: ${toolDescriptions.get_journal}\n\n`;
                enhancedPrompt += `**CRITICAL FOR TAGS AGENT: DO NOT SUGGEST TAGS - ADD THEM DIRECTLY!**\n`;
                enhancedPrompt += `1. When given journal content, immediately analyze and add relevant tags using add_tags tool\n`;
                enhancedPrompt += `2. When given a journal ID, fetch it with get_journal then add appropriate tags\n`;
                enhancedPrompt += `3. Always execute add_tags tool - never just suggest what tags should be added\n`;
                enhancedPrompt += `4. Format response: "Added tags: #python #machine-learning #tensorflow" (no quotes or backticks)\n`;
                enhancedPrompt += `5. Keep your response under 50 words confirming the action taken\n\n`;
            } else if (agentName === 'retrieval') {
                enhancedPrompt += `**Memory & Retrieval Tools (EXECUTE THESE ACTIVELY):**\n`;
                enhancedPrompt += `- search_memories: ${toolDescriptions.search_memories}\n`;
                enhancedPrompt += `- get_memories_by_type: ${toolDescriptions.get_memories_by_type}\n`;
                enhancedPrompt += `- get_user_memories: ${toolDescriptions.get_user_memories}\n`;
                enhancedPrompt += `- search_journals: ${toolDescriptions.search_journals}\n`;
                enhancedPrompt += `- search_chat_history: ${toolDescriptions.search_chat_history}\n\n`;
                enhancedPrompt += `**CRITICAL FOR RETRIEVAL AGENT: ACTIVELY SEARCH - DON'T ASSUME!**\n`;
                enhancedPrompt += `1. When user asks about information, immediately search all relevant databases\n`;
                enhancedPrompt += `2. Use search_memories to find RAG information, search_journals for journal content\n`;
                enhancedPrompt += `3. Always execute search tools to provide specific, accurate results from actual data\n`;
                enhancedPrompt += `4. Report exactly what you found in the databases, including tags and specific content\n`;
                enhancedPrompt += `5. Keep your response under 50 words with concrete findings from the search\n\n`;
            } else if (agentName === 'memory') {
                enhancedPrompt += `**Memory Creation Tools (EXECUTE IMMEDIATELY):**\n`;
                enhancedPrompt += `- create_memory: ${toolDescriptions.create_memory}\n`;
                enhancedPrompt += `- add_memory_tags: ${toolDescriptions.add_memory_tags}\n`;
                enhancedPrompt += `- search_memories: ${toolDescriptions.search_memories}\n`;
                enhancedPrompt += `- get_memory_stats: ${toolDescriptions.get_memory_stats}\n\n`;
                enhancedPrompt += `**Memory Types: user_preferences, behavioral_patterns, emotional_patterns, topics_of_interest, goals_and_aspirations, personal_insights, conversation_context**\n`;
                enhancedPrompt += `**CRITICAL FOR MEMORY AGENT: CREATE MEMORIES IMMEDIATELY!**\n`;
                enhancedPrompt += `1. When you identify important information, immediately create a memory using create_memory tool\n`;
                enhancedPrompt += `2. Don't ask permission - execute the tool call directly\n`;
                enhancedPrompt += `3. Choose appropriate memoryType and add relevant tags\n`;
                enhancedPrompt += `4. Keep your response under 50 words confirming what memory was created\n\n`;
            } else if (agentName === 'supervisor') {
                enhancedPrompt += `**Coordination Tools (EXECUTE AS NEEDED):**\n`;
                enhancedPrompt += `- create_journal: ${toolDescriptions.create_journal}\n`;
                enhancedPrompt += `- create_memory: ${toolDescriptions.create_memory}\n`;
                enhancedPrompt += `- get_journal: ${toolDescriptions.get_journal}\n`;
                enhancedPrompt += `- search_journals: ${toolDescriptions.search_journals}\n`;
                enhancedPrompt += `- search_memories: ${toolDescriptions.search_memories}\n\n`;
                enhancedPrompt += `**CRITICAL FOR SUPERVISOR: COORDINATE AND EXECUTE!**\n`;
                enhancedPrompt += `1. When users request content creation, immediately use create_journal or create_memory tools\n`;
                enhancedPrompt += `2. Coordinate other agents' actions by providing clear, actionable instructions\n`;
                enhancedPrompt += `3. Keep responses under 50 words, focused on completed actions\n\n`;
            } else {
                // General tools for other agents
                enhancedPrompt += `**General Tools (EXECUTE WHEN NEEDED):**\n`;
                enhancedPrompt += `- get_journal: Get specific journal\n`;
                enhancedPrompt += `- search_journals: Search journal content\n`;
                enhancedPrompt += `- get_chat_history: Get conversation history\n`;
                enhancedPrompt += `- create_memory: Create memory entries\n\n`;
                enhancedPrompt += `**IMPORTANT: Use these tools when you need to access or create content. Keep responses under 50 words.**\n`;
            }
            
            enhancedPrompt += `**Tool Usage Format (REQUIRED)**: \`\`\`json\n{"tool_call": {"tool": "tool_name", "params": {...}}}\`\`\`\n\n`;
            enhancedPrompt += `**UNIVERSAL RESPONSE REQUIREMENTS:**\n`;
            enhancedPrompt += `1. Execute tools immediately when needed - don't ask permission\n`;
            enhancedPrompt += `2. Keep ALL responses concise: maximum 50 words\n`;
            enhancedPrompt += `3. Focus on actions taken, not suggestions or possibilities\n`;
            enhancedPrompt += `4. Report concrete results from tool execution\n`;
            enhancedPrompt += `5. Use active voice: "Added tags: #python #machine-learning" not "You could add tags"\n`;
            enhancedPrompt += `6. When mentioning tags, format as: #tagname NOT 'tagname' or \`tagname\`\n`;
            enhancedPrompt += `7. Example: "Added tags: #python #machine-learning #tensorflow" (no quotes or backticks)\n\n`;
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
                    max_tokens: 150, // Reduced from 500 to enforce concise responses
                });

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`${getAgentDisplayName(agentName)} timeout after ${AGENT_TIMEOUT}ms`)), AGENT_TIMEOUT);
                });

                const response = await Promise.race([responsePromise, timeoutPromise]);
                let agentResponse = response.choices[0].message.content;
                
                // Quick tool execution (with timeout)
                if (backendTools && agentResponse.includes('"tool_call"')) {
                    try {
                        console.log(`🔧 Detected tool call in ${agentName} response`);
                        const toolCallMatch = agentResponse.match(/json\s*(\{[\s\S]*?"tool_call"[\s\S]*?\})\s*/);
                        if (toolCallMatch) {
                            const toolCallData = JSON.parse(toolCallMatch[1]);
                            if (toolCallData.tool_call) {
                                console.log(`🛠️ Executing tool: ${toolCallData.tool_call.tool}`);
                                console.log(`📋 Tool params:`, toolCallData.tool_call.params);
                                
                                // Execute tool with timeout
                                const toolPromise = backendTools.executeTool(
                                    toolCallData.tool_call.tool, 
                                    toolCallData.tool_call.params
                                );
                                const toolTimeoutPromise = new Promise((_, reject) => {
                                    setTimeout(() => reject(new Error('Tool timeout')), 5000);
                                });
                                
                                const toolResult = await Promise.race([toolPromise, toolTimeoutPromise]);
                                console.log(`✅ Tool execution result:`, toolResult);
                                
                                // Quick follow-up response
                                const followUpPromise = client.chat.completions.create({
                                    model: process.env.LLM || "kimi-k2-0711-preview",
                                    messages: [
                                        {
                                            role: "system",
                                            content: "Provide a brief response based on the tool result. Maximum 50 words. Focus on what was accomplished."
                                        },
                                        {
                                            role: "user",
                                            content: `Tool result: ${JSON.stringify(toolResult)}\n\nBrief response confirming action taken (max 50 words):`
                                        }
                                    ],
                                    temperature: 0.6,
                                    max_tokens: 100, // Reduced from 200 for conciseness
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
                
                // Process structured response for backend actions
                const processedResponse = processStructuredResponse(agentResponse);
                
                // Execute backend actions if structured data exists
                if (processedResponse.hasStructuredData && userContext) {
                    try {
                        const actionResults = await executeBackendActions(processedResponse.structuredData, userContext);
                        
                        // Return both user response and action results for internal processing
                        return {
                            userResponse: `\`\`\`\n${processedResponse.userResponse}\n\`\`\``,
                            actionResults: actionResults,
                            hasActions: true,
                            originalResponse: agentResponse
                        };
                    } catch (actionError) {
                        console.error(`Error executing backend actions:`, actionError);
                        // Return just the user response if actions fail
                        return {
                            userResponse: `\`\`\`\n${processedResponse.userResponse}\n\`\`\``,
                            actionResults: null,
                            hasActions: false,
                            originalResponse: agentResponse
                        };
                    }
                }
                
                // Return simple response for backward compatibility
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
            chunk: '<start>Generating initial response...</start>\n\n' 
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
        return "An error occurred while processing your request due to API rate limit. Please try again in 1 minute.";
    }
};

// Export BackendTools for external use
export { BackendTools, getAgentDisplayName, processStructuredResponse };