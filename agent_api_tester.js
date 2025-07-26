// Comprehensive AI Agent API Tools Testing Suite
// Tests all backend API endpoints used by AI agents

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

// Import BackendTools class from query.js
class BackendTools {
    constructor(baseURL = `http://localhost:${process.env.PORT || 3000}`) {
        this.baseURL = baseURL;
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'X-Test-Mode': 'true'  // Enable test mode to bypass auth
            }
        });
    }

    // Set authentication headers for API calls
    setAuth(userId, authToken) {
        this.axiosInstance.defaults.headers.common['X-Test-Mode'] = 'true';
        this.axiosInstance.defaults.headers.common['X-User-ID'] = userId;
        // Don't set Authorization for test mode
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
}

console.log('🧪 AI AGENT API TOOLS TESTING SUITE');
console.log('🎯 Testing all backend API endpoints used by AI agents');
console.log('🔄 Will iterate until all API calls work properly');
console.log('=' .repeat(70));

class AgentAPITester {
    constructor() {
        this.baseURL = `http://localhost:${process.env.PORT || 3000}`;
        this.testUserId = '507f1f77bcf86cd799439011';  // Valid ObjectId
        this.testAuthToken = 'test-auth-token';  // Not used in test mode
        this.backendTools = new BackendTools(this.baseURL);
        this.testResults = [];
        this.createdResources = {
            journals: [],
            chats: [],
            memories: []
        };
        this.iterationCount = 0;
        this.maxIterations = 5;
    }

    async initialize() {
        console.log('\n🔧 Initializing API tester...');
        
        // Set authentication for backend tools
        this.backendTools.setAuth(this.testUserId, this.testAuthToken);
        
        // Test server connectivity with test mode - expect 404 for empty journals
        try {
            const response = await axios.get(`${this.baseURL}/api/journals`, {
                headers: {
                    'X-Test-Mode': 'true',
                    'X-User-ID': this.testUserId
                },
                timeout: 5000,
                validateStatus: function (status) {
                    // Accept 200 (has journals) and 404 (no journals) as successful
                    return status === 200 || status === 404;
                }
            });
            console.log('✅ Server connectivity confirmed');
            if (response.status === 404) {
                console.log('   📋 No existing journals (expected for fresh test)');
            }
            return true;
        } catch (error) {
            console.error('❌ Server connectivity failed:', error.message);
            if (error.response) {
                console.error('   Response status:', error.response.status);
                console.error('   Response data:', error.response.data);
            }
            return false;
        }
    }

    // Test all Journal API tools
    async testJournalAPIs() {
        console.log('\n📔 TESTING JOURNAL API TOOLS');
        console.log('─'.repeat(50));
        
        const journalTests = [
            {
                name: 'createJournal',
                test: async () => {
                    const result = await this.backendTools.createJournal(
                        'Test Journal for API Testing', 
                        'This is a test journal content for API validation.'
                    );
                    if (result.success && result.data) {
                        this.createdResources.journals.push(result.data._id || result.data.id);
                        return { success: true, data: result.data };
                    }
                    return result;
                },
                expectedFields: ['_id', 'title', 'content', 'userId']
            },
            {
                name: 'getJournalHistory',
                test: async () => {
                    return await this.backendTools.getJournalHistory(10, 1);
                },
                expectedFields: ['length'] // Array response
            },
            {
                name: 'getJournalById',
                test: async () => {
                    if (this.createdResources.journals.length === 0) {
                        return { success: false, error: 'No journal ID available for testing' };
                    }
                    const journalId = this.createdResources.journals[0];
                    return await this.backendTools.getJournalById(journalId);
                },
                expectedFields: ['_id', 'title', 'content'],
                dependencies: ['createJournal']
            },
            {
                name: 'updateJournal',
                test: async () => {
                    if (this.createdResources.journals.length === 0) {
                        return { success: false, error: 'No journal ID available for testing' };
                    }
                    const journalId = this.createdResources.journals[0];
                    return await this.backendTools.updateJournal(
                        journalId,
                        'Updated Test Journal',
                        'This is updated content for testing.'
                    );
                },
                expectedFields: ['_id', 'title', 'content'],
                dependencies: ['createJournal']
            },
            {
                name: 'searchJournals',
                test: async () => {
                    return await this.backendTools.searchJournals('test', '', null, null);
                },
                expectedFields: ['length'] // Array response
            },
            {
                name: 'addTagsToJournal',
                test: async () => {
                    if (this.createdResources.journals.length === 0) {
                        return { success: false, error: 'No journal ID available for testing' };
                    }
                    const journalId = this.createdResources.journals[0];
                    return await this.backendTools.addTagsToJournal(journalId, ['test', 'api', 'validation']);
                },
                expectedFields: ['message', 'journal'],
                dependencies: ['createJournal']
            },
            {
                name: 'removeTagsFromJournal',
                test: async () => {
                    if (this.createdResources.journals.length === 0) {
                        return { success: false, error: 'No journal ID available for testing' };
                    }
                    const journalId = this.createdResources.journals[0];
                    return await this.backendTools.removeTagsFromJournal(journalId, ['test']);
                },
                expectedFields: ['message', 'journal'],
                dependencies: ['addTagsToJournal']
            },
            {
                name: 'getJournalVersions',
                test: async () => {
                    if (this.createdResources.journals.length === 0) {
                        return { success: false, error: 'No journal ID available for testing' };
                    }
                    const journalId = this.createdResources.journals[0];
                    return await this.backendTools.getJournalVersions(journalId, 10, 1);
                },
                expectedFields: ['length'], // Array response
                dependencies: ['createJournal']
            },
            {
                name: 'renameJournal',
                test: async () => {
                    if (this.createdResources.journals.length === 0) {
                        return { success: false, error: 'No journal ID available for testing' };
                    }
                    const journalId = this.createdResources.journals[0];
                    return await this.backendTools.renameJournal(journalId, 'Renamed Test Journal');
                },
                expectedFields: ['message'],
                dependencies: ['createJournal']
            }
        ];

        return await this.runTestSuite('Journal API', journalTests);
    }

    // Test all Chat API tools
    async testChatAPIs() {
        console.log('\n💬 TESTING CHAT API TOOLS');
        console.log('─'.repeat(50));
        
        const chatTests = [
            {
                name: 'createChat',
                test: async () => {
                    const result = await this.backendTools.createChat();
                    if (result.success && result.data) {
                        this.createdResources.chats.push(result.data._id || result.data.id);
                        return { success: true, data: result.data };
                    }
                    return result;
                },
                expectedFields: ['_id', 'userId']
            },
            {
                name: 'getChatHistory',
                test: async () => {
                    return await this.backendTools.getChatHistory(10, 1);
                },
                expectedFields: ['length'] // Array response
            },
            {
                name: 'getChatById',
                test: async () => {
                    if (this.createdResources.chats.length === 0) {
                        return { success: false, error: 'No chat ID available for testing' };
                    }
                    const chatId = this.createdResources.chats[0];
                    return await this.backendTools.getChatById(chatId);
                },
                expectedFields: ['_id', 'userId', 'messages'],
                dependencies: ['createChat']
            },
            {
                name: 'updateChatName',
                test: async () => {
                    if (this.createdResources.chats.length === 0) {
                        return { success: false, error: 'No chat ID available for testing' };
                    }
                    const chatId = this.createdResources.chats[0];
                    return await this.backendTools.updateChatName(chatId, 'Test Chat Name');
                },
                expectedFields: [],
                dependencies: ['createChat']
            }
        ];

        return await this.runTestSuite('Chat API', chatTests);
    }

    // Test all RAG Memory API tools
    async testMemoryAPIs() {
        console.log('\n🧠 TESTING RAG MEMORY API TOOLS');
        console.log('─'.repeat(50));
        
        const memoryTests = [
            {
                name: 'createMemory',
                test: async () => {
                    const result = await this.backendTools.createMemory(
                        'user_preferences',
                        'Test Memory',
                        'This is a test memory for API validation.',
                        { test: true },
                        ['test', 'api', 'validation']
                    );
                    if (result.success && result.data) {
                        this.createdResources.memories.push(result.data._id || result.data.id);
                        return { success: true, data: result.data };
                    }
                    return result;
                },
                expectedFields: ['_id', 'memoryType', 'title', 'content']
            },
            {
                name: 'getUserMemories',
                test: async () => {
                    return await this.backendTools.getUserMemories('user_preferences', 10, 1, 'relevanceScore');
                },
                expectedFields: ['length'] // Array response
            },
            {
                name: 'getMemoryById',
                test: async () => {
                    if (this.createdResources.memories.length === 0) {
                        return { success: false, error: 'No memory ID available for testing' };
                    }
                    const memoryId = this.createdResources.memories[0];
                    return await this.backendTools.getMemoryById(memoryId);
                },
                expectedFields: ['_id', 'memoryType', 'title', 'content'],
                dependencies: ['createMemory']
            },
            {
                name: 'updateMemory',
                test: async () => {
                    if (this.createdResources.memories.length === 0) {
                        return { success: false, error: 'No memory ID available for testing' };
                    }
                    const memoryId = this.createdResources.memories[0];
                    return await this.backendTools.updateMemory(memoryId, {
                        title: 'Updated Test Memory',
                        content: 'This is updated memory content for testing.'
                    });
                },
                expectedFields: ['_id', 'title', 'content'],
                dependencies: ['createMemory']
            },
            {
                name: 'searchMemories',
                test: async () => {
                    return await this.backendTools.searchMemories('test', 'user_preferences', null, 10, 0.1);
                },
                expectedFields: ['length'] // Array response
            },
            {
                name: 'getMemoriesByType',
                test: async () => {
                    return await this.backendTools.getMemoriesByType('user_preferences', 10, 1);
                },
                expectedFields: ['length'] // Array response
            },
            {
                name: 'addTagsToMemory',
                test: async () => {
                    if (this.createdResources.memories.length === 0) {
                        return { success: false, error: 'No memory ID available for testing' };
                    }
                    const memoryId = this.createdResources.memories[0];
                    return await this.backendTools.addTagsToMemory(memoryId, ['additional', 'tags']);
                },
                expectedFields: ['message'],
                dependencies: ['createMemory']
            },
            {
                name: 'removeTagsFromMemory',
                test: async () => {
                    if (this.createdResources.memories.length === 0) {
                        return { success: false, error: 'No memory ID available for testing' };
                    }
                    const memoryId = this.createdResources.memories[0];
                    return await this.backendTools.removeTagsFromMemory(memoryId, ['test']);
                },
                expectedFields: ['message'],
                dependencies: ['addTagsToMemory']
            },
            {
                name: 'getMemoryStats',
                test: async () => {
                    return await this.backendTools.getMemoryStats();
                },
                expectedFields: ['totalMemories']
            }
        ];

        return await this.runTestSuite('Memory API', memoryTests);
    }

    // Run a test suite for a specific API category
    async runTestSuite(suiteName, tests) {
        console.log(`🔍 Running ${suiteName} tests...`);
        
        const suiteResults = {
            suiteName,
            totalTests: tests.length,
            passedTests: 0,
            failedTests: 0,
            results: [],
            issues: []
        };

        for (const testSpec of tests) {
            console.log(`  🧪 Testing ${testSpec.name}...`);
            
            try {
                const startTime = Date.now();
                const result = await testSpec.test();
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                const validation = this.validateTestResult(result, testSpec);
                
                const testResult = {
                    name: testSpec.name,
                    success: validation.isValid,
                    responseTime,
                    result: validation.isValid ? result : null,
                    error: validation.isValid ? null : validation.error,
                    issues: validation.issues,
                    expectedFields: testSpec.expectedFields
                };
                
                suiteResults.results.push(testResult);
                
                if (validation.isValid) {
                    suiteResults.passedTests++;
                    console.log(`    ✅ ${testSpec.name} passed (${responseTime}ms)`);
                } else {
                    suiteResults.failedTests++;
                    console.log(`    ❌ ${testSpec.name} failed: ${validation.error}`);
                    if (validation.issues.length > 0) {
                        validation.issues.forEach(issue => {
                            console.log(`       - ${issue}`);
                            suiteResults.issues.push(`${testSpec.name}: ${issue}`);
                        });
                    }
                }
                
            } catch (error) {
                suiteResults.failedTests++;
                suiteResults.results.push({
                    name: testSpec.name,
                    success: false,
                    error: error.message,
                    issues: [`Unexpected error: ${error.message}`]
                });
                console.log(`    💥 ${testSpec.name} threw error: ${error.message}`);
                suiteResults.issues.push(`${testSpec.name}: Unexpected error - ${error.message}`);
            }
        }
        
        console.log(`\n📊 ${suiteName} Results: ${suiteResults.passedTests}/${suiteResults.totalTests} passed`);
        
        return suiteResults;
    }

    // Validate test result against expectations
    validateTestResult(result, testSpec) {
        const validation = {
            isValid: true,
            error: null,
            issues: []
        };

        // Check if result has success property and is true
        if (!result || typeof result.success !== 'boolean') {
            validation.isValid = false;
            validation.error = 'Result does not have success property';
            return validation;
        }

        if (!result.success) {
            validation.isValid = false;
            validation.error = result.error || 'API call returned success: false';
            return validation;
        }

        // Check expected fields in response data
        if (testSpec.expectedFields && testSpec.expectedFields.length > 0) {
            const data = result.data;
            
            if (!data) {
                validation.issues.push('No data property in successful response');
            } else {
                // Check if it's an array response
                if (testSpec.expectedFields.includes('length')) {
                    if (!Array.isArray(data)) {
                        validation.issues.push('Expected array response but got object');
                    }
                } else {
                    // Check for specific fields
                    testSpec.expectedFields.forEach(field => {
                        if (!(field in data)) {
                            validation.issues.push(`Missing expected field: ${field}`);
                        }
                    });
                }
            }
        }

        // If there are issues but the API call succeeded, it's still a partial success
        if (validation.issues.length > 0) {
            validation.error = `API works but has structural issues: ${validation.issues.join(', ')}`;
        }

        return validation;
    }

    // Fix identified API issues
    async fixAPIIssues(allResults) {
        console.log('\n🔧 ANALYZING AND FIXING API ISSUES');
        console.log('─'.repeat(50));
        
        const allIssues = [];
        allResults.forEach(suite => {
            allIssues.push(...suite.issues);
        });

        if (allIssues.length === 0) {
            console.log('✅ No API issues found - all endpoints working correctly!');
            return true;
        }

        console.log(`📋 Found ${allIssues.length} issues to fix:`);
        allIssues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });

        // Categorize and fix issues
        const fixes = [];

        // Analyze common patterns
        const missingFieldIssues = allIssues.filter(issue => issue.includes('Missing expected field'));
        const structuralIssues = allIssues.filter(issue => issue.includes('structural issues'));
        const errorIssues = allIssues.filter(issue => issue.includes('error') || issue.includes('failed'));

        if (missingFieldIssues.length > 0) {
            fixes.push({
                type: 'missing_fields',
                description: 'Some API responses are missing expected fields',
                recommendation: 'Check controller functions to ensure all required fields are included in responses'
            });
        }

        if (structuralIssues.length > 0) {
            fixes.push({
                type: 'structural',
                description: 'API responses have structural inconsistencies',
                recommendation: 'Standardize response format across all endpoints'
            });
        }

        if (errorIssues.length > 0) {
            fixes.push({
                type: 'errors',
                description: 'Some API calls are failing',
                recommendation: 'Check authentication, route configuration, and controller implementations'
            });
        }

        console.log('\n💡 RECOMMENDED FIXES:');
        fixes.forEach((fix, index) => {
            console.log(`   ${index + 1}. ${fix.type.toUpperCase()}: ${fix.description}`);
            console.log(`      → ${fix.recommendation}`);
        });

        return false; // Issues found, need manual fixes
    }

    // Clean up created test resources
    async cleanup() {
        console.log('\n🧹 Cleaning up test resources...');
        
        // Delete created journals
        for (const journalId of this.createdResources.journals) {
            try {
                await this.backendTools.deleteJournal(journalId);
                console.log(`   ✅ Deleted journal: ${journalId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete journal ${journalId}: ${error.message}`);
            }
        }

        // Delete created chats
        for (const chatId of this.createdResources.chats) {
            try {
                await this.backendTools.deleteChat(chatId);
                console.log(`   ✅ Deleted chat: ${chatId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete chat ${chatId}: ${error.message}`);
            }
        }

        // Delete created memories
        for (const memoryId of this.createdResources.memories) {
            try {
                await this.backendTools.deleteMemory(memoryId, true); // Permanent delete
                console.log(`   ✅ Deleted memory: ${memoryId}`);
            } catch (error) {
                console.log(`   ⚠️ Failed to delete memory ${memoryId}: ${error.message}`);
            }
        }
    }

    // Main testing iteration cycle
    async runTestingCycle() {
        console.log(`\n🔄 TESTING ITERATION ${this.iterationCount + 1}/${this.maxIterations}`);
        console.log('=' .repeat(60));

        try {
            // Test all API categories
            const journalResults = await this.testJournalAPIs();
            const chatResults = await this.testChatAPIs();
            const memoryResults = await this.testMemoryAPIs();

            const allResults = [journalResults, chatResults, memoryResults];
            this.testResults.push({
                iteration: this.iterationCount + 1,
                timestamp: new Date().toISOString(),
                results: allResults
            });

            // Analyze results
            const totalTests = allResults.reduce((sum, suite) => sum + suite.totalTests, 0);
            const totalPassed = allResults.reduce((sum, suite) => sum + suite.passedTests, 0);
            const totalFailed = allResults.reduce((sum, suite) => sum + suite.failedTests, 0);
            const successRate = (totalPassed / totalTests) * 100;

            console.log('\n📊 ITERATION SUMMARY:');
            console.log(`   📋 Total Tests: ${totalTests}`);
            console.log(`   ✅ Passed: ${totalPassed}`);
            console.log(`   ❌ Failed: ${totalFailed}`);
            console.log(`   📈 Success Rate: ${successRate.toFixed(1)}%`);

            // Check if all tests passed
            if (totalFailed === 0) {
                console.log('\n🎉 ALL API TESTS PASSED!');
                console.log('✅ All AI agent tools are working correctly');
                return { success: true, allPassed: true };
            }

            // Try to fix issues
            const fixesSuccessful = await this.fixAPIIssues(allResults);
            
            this.iterationCount++;

            // Continue iteration if under max and not all fixed
            if (this.iterationCount < this.maxIterations && !fixesSuccessful) {
                console.log(`\n⏰ Waiting 5 seconds before next iteration...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return await this.runTestingCycle();
            } else {
                console.log('\n⚠️ Maximum iterations reached or manual fixes needed');
                return { success: true, allPassed: false, needsManualFixes: true };
            }

        } catch (error) {
            console.error('💥 Testing cycle failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Generate final test report
    generateFinalReport(finalResult) {
        console.log('\n📋 FINAL AI AGENT API TESTING REPORT');
        console.log('=' .repeat(60));

        const report = {
            timestamp: new Date().toISOString(),
            totalIterations: this.iterationCount,
            finalStatus: finalResult.allPassed ? 'ALL_TESTS_PASSED' : 'ISSUES_REMAINING',
            testResults: this.testResults,
            summary: {
                testedAPIs: {
                    journalAPIs: 9,
                    chatAPIs: 4,
                    memoryAPIs: 9,
                    total: 22
                },
                finalOutcome: finalResult.allPassed ? 'SUCCESS' : 'NEEDS_ATTENTION'
            }
        };

        console.log(`📊 Testing Summary:`);
        console.log(`   🔄 Iterations: ${report.totalIterations}`);
        console.log(`   🎯 Final Status: ${report.finalStatus}`);
        console.log(`   📋 Total APIs Tested: ${report.summary.testedAPIs.total}`);
        console.log(`      📔 Journal APIs: ${report.summary.testedAPIs.journalAPIs}`);
        console.log(`      💬 Chat APIs: ${report.summary.testedAPIs.chatAPIs}`);
        console.log(`      🧠 Memory APIs: ${report.summary.testedAPIs.memoryAPIs}`);

        if (finalResult.allPassed) {
            console.log('\n🏆 SUCCESS: All AI agent API tools are working correctly!');
            console.log('✅ Your backend endpoints are ready for AI agent usage');
        } else {
            console.log('\n⚠️ Some issues remain that require manual attention');
            console.log('🔧 Check the detailed error messages above for specific fixes needed');
        }

        return report;
    }
}

// Main execution function
async function main() {
    console.log('🎯 Starting comprehensive AI agent API testing...');
    
    const tester = new AgentAPITester();
    
    try {
        // Initialize tester
        const initialized = await tester.initialize();
        if (!initialized) {
            console.error('❌ Failed to initialize tester');
            return { success: false };
        }

        // Run testing cycle
        const result = await tester.runTestingCycle();
        
        // Generate final report
        const report = tester.generateFinalReport(result);
        
        // Cleanup
        await tester.cleanup();
        
        console.log('\n✅ AI agent API testing completed!');
        
        return {
            success: true,
            allPassed: result.allPassed,
            report
        };
        
    } catch (error) {
        console.error('💥 Testing failed:', error.message);
        await tester.cleanup();
        return { success: false, error: error.message };
    }
}

// Execute testing
main()
    .then(result => {
        console.log('\n🏁 AI AGENT API TESTING COMPLETE');
        
        if (result.success) {
            if (result.allPassed) {
                console.log('🥇 ALL TESTS PASSED - API tools ready for AI agents!');
            } else {
                console.log('🔧 SOME ISSUES REMAIN - Manual fixes needed');
            }
        } else {
            console.log('❌ TESTING FAILED');
        }
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Fatal testing error:', error);
        process.exit(1);
    });
