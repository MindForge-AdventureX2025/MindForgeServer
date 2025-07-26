# MindForge AI Agent Tools Integration Guide

## Overview

The MindForge AI Agent system now includes comprehensive backend API tools that enable all agents to interact directly with your application's data. This integration allows agents to perform real CRUD operations on journals, chats, and user data.

## 🛠️ Available Tools

### Journal Management Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `create_journal` | Create a new journal entry | `{title: string, content: string}` |
| `get_journal` | Get a specific journal by ID | `{id: string}` |
| `get_journal_history` | Get user's journal history | `{limit?: number, page?: number}` |
| `update_journal` | Update an existing journal | `{id: string, title: string, content: string}` |
| `search_journals` | Search journals by keyword and filters | `{keyword: string, tags?: string, from?: date, to?: date}` |
| `add_tags` | Add tags to a journal | `{id: string, tags: string[]}` |
| `remove_tags` | Remove tags from a journal | `{id: string, tags: string[]}` |
| `get_journal_versions` | Get version history of a journal | `{id: string, limit?: number, page?: number}` |
| `set_journal_version` | Restore a journal to a specific version | `{id: string, versionId: string}` |
| `rename_journal` | Rename a journal | `{id: string, name: string}` |
| `delete_journal` | Delete a journal | `{id: string}` |

### Chat Management Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `create_chat` | Create a new chat session | `{}` |
| `get_chat` | Get a specific chat by ID | `{id: string}` |
| `get_chat_history` | Get user's chat history | `{limit?: number, page?: number}` |
| `update_chat_name` | Update chat name | `{id: string, name: string}` |
| `delete_chat` | Delete a chat | `{id: string}` |

## 🤖 Agent-Specific Tool Usage

### Retrieval Agent
**Primary Tools**: `search_journals`, `get_journal_history`, `get_journal`, `get_journal_versions`

**Use Cases**:
- Finding specific journal entries based on keywords
- Retrieving historical context for user queries
- Accessing journal versions for temporal analysis

### Tags Agent  
**Primary Tools**: `add_tags`, `remove_tags`, `search_journals`

**Use Cases**:
- Adding descriptive tags to journal entries
- Removing outdated or incorrect tags
- Analyzing tag patterns across journals

### Enhancement Agent
**Primary Tools**: `get_journal`, `update_journal`, `get_journal_versions`

**Use Cases**:
- Retrieving journal content for enhancement
- Updating journals with improved content
- Comparing different versions for enhancement patterns

### Memory Agent
**Primary Tools**: `get_journal_history`, `search_journals`, `get_chat_history`

**Use Cases**:
- Analyzing long-term patterns and trends
- Building comprehensive user context
- Tracking behavioral and emotional evolution

### Emotion Agent
**Primary Tools**: `search_journals`, `get_journal_history`

**Use Cases**:
- Analyzing emotional patterns across time
- Finding journals with specific emotional content
- Building emotional context for empathetic responses

### Summarization Agent
**Primary Tools**: `get_journal_history`, `search_journals`

**Use Cases**:
- Gathering comprehensive data for summarization
- Creating overviews of journal collections
- Condensing large amounts of historical data

### Report Agent
**Primary Tools**: All tools (as final coordinator)

**Use Cases**:
- Accessing all necessary data for comprehensive reports
- Creating new summary journals if needed
- Coordinating data from multiple sources

## 🔧 Tool Usage Format

Agents use tools by including JSON tool calls in their responses:

```json
{
  "tool_call": {
    "tool": "search_journals",
    "params": {
      "keyword": "anxiety",
      "tags": "emotional,personal",
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
  }
}
```

## 🔄 Tool Execution Workflow

1. **Agent Request**: Agent includes tool call in response
2. **Tool Execution**: System executes the API call automatically
3. **Result Processing**: Tool results are provided back to the agent
4. **Final Response**: Agent formulates response based on actual data

## 🏗️ Implementation Architecture

### BackendTools Class
Located in `./utils/query.js`, this class provides:
- HTTP client configuration with axios
- Authentication header management
- Comprehensive API endpoint coverage
- Error handling and response formatting
- Tool execution routing

### Agent Integration
- Tools are automatically injected into agent prompts
- User authentication context passed through workflow
- Tool results are seamlessly integrated into agent responses
- Fallback mechanisms for tool failures

### Security & Authentication
- User authentication tokens passed through request headers
- User ID validation for data access control
- Scoped access to user's own data only
- Error handling for unauthorized access

## 📊 Testing & Validation

### Available Test Functions
```javascript
// Test tool availability and descriptions
await testBackendTools();

// Test agent workflow with tools
await testQuery("Search my journals for productivity tips");
```

### Running Tests
```bash
npm run test:query
```

## 🚀 Usage Examples

### Retrieval Agent with Tools
```javascript
// Agent receives: "Find my journal entries about productivity"
// Agent uses tool:
{
  "tool_call": {
    "tool": "search_journals", 
    "params": {
      "keyword": "productivity",
      "limit": 10
    }
  }
}
// Agent gets actual journal data and provides specific results
```

### Enhancement Agent with Tools
```javascript
// Agent receives: "Improve my latest journal entry"
// Step 1: Get latest journal
{
  "tool_call": {
    "tool": "get_journal_history",
    "params": {"limit": 1}
  }
}
// Step 2: Get specific journal content
{
  "tool_call": {
    "tool": "get_journal",
    "params": {"id": "journal_id"}
  }
}
// Step 3: Update with enhanced content
{
  "tool_call": {
    "tool": "update_journal",
    "params": {
      "id": "journal_id",
      "title": "Enhanced Title",
      "content": "Enhanced content..."
    }
  }
}
```

## 🎯 Benefits

1. **Real Data Access**: Agents work with actual user data, not simulated responses
2. **Dynamic Operations**: Agents can create, read, update, and delete data
3. **Contextual Intelligence**: Access to full historical context improves agent responses
4. **Seamless Integration**: Tools work transparently within the agent workflow
5. **Scalable Architecture**: Easy to add new endpoints as tools

## 🔮 Future Enhancements

- **Real-time Notifications**: Tools that trigger real-time updates
- **Advanced Analytics**: Statistical analysis tools for deeper insights  
- **External Integrations**: Tools for connecting to external services
- **Batch Operations**: Tools for processing multiple items efficiently
- **Caching Layer**: Intelligent caching for frequently accessed data

## 📝 Notes

- Tools require a running backend server for API calls
- Authentication must be properly configured
- Tool failures gracefully fallback to original agent responses
- All tools respect user data privacy and access controls
