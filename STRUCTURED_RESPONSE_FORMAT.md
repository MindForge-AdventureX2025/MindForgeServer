# AI Agent Structured Response Format

## Overview

AI agents can now include structured data in their responses to trigger backend actions without exposing these actions to the user. This enables automatic journal modifications, memory creation, and other backend operations based on AI agent decisions.

## Structured Response Format

AI agents can include structured data in their responses using HTML comment markers:

```
User-facing response content here...

<!--STRUCTURED_DATA_START-->
{
  "actions": [
    {
      "type": "journal_update",
      "journalId": "journal_123",
      "selectedText": "I feel sad today",
      "newText": "I feel sad today, but I'm working on understanding these emotions better",
      "operation": "replace"
    }
  ]
}
<!--STRUCTURED_DATA_END-->
```

## Available Action Types

### 1. Journal Update
Modify specific text within a journal entry:

```json
{
  "type": "journal_update",
  "journalId": "string",
  "selectedText": "string - exact text to find",
  "newText": "string - replacement text",
  "operation": "replace|insert_before|insert_after|append|prepend"
}
```

### 2. Bulk Journal Update
Update multiple journals at once:

```json
{
  "type": "bulk_journal_update",
  "updates": [
    {
      "id": "journal_123",
      "selectedText": "old text",
      "newText": "new text",
      "operation": "replace"
    }
  ]
}
```

### 3. Journal Analysis
Analyze patterns across multiple journals:

```json
{
  "type": "journal_analysis",
  "journalIds": ["journal_123", "journal_456"],
  "analysisType": "mood|themes|progress|sentiment"
}
```

### 4. Memory Creation
Create new memory entries:

```json
{
  "type": "memory_creation",
  "memoryData": {
    "memoryType": "insight",
    "title": "User Emotional Pattern",
    "content": "User shows improvement in emotional awareness",
    "metadata": {
      "confidence": 0.85,
      "source": "journal_analysis"
    },
    "tags": ["emotion", "progress"]
  }
}
```

### 5. Tag Management
Add or remove tags from journals/memories:

```json
{
  "type": "tag_management",
  "targetType": "journal|memory",
  "targetId": "string",
  "operation": "add|remove",
  "tags": ["tag1", "tag2"]
}
```

## Enhanced Tools Available to AI Agents

### Enhanced Journal Tools
- `get_multiple_journals`: Get multiple journals by IDs
- `partial_update_journal`: Update specific text in a journal
- `bulk_update_journals`: Update multiple journals at once
- `analyze_journal_patterns`: Analyze patterns across journals
- `get_journals_by_date_range`: Get journals within date range
- `create_journal_template`: Create reusable journal templates
- `get_journal_templates`: Get available templates

### Enhanced Chat Tools
- `search_chat_history`: Search through chat history by keyword and date range

### All Available Tools

#### Journal Tools (18 total)
- create_journal, get_journal, get_journal_history
- update_journal, search_journals, add_tags, remove_tags
- get_journal_versions, set_journal_version, rename_journal, delete_journal
- get_multiple_journals, partial_update_journal, bulk_update_journals
- analyze_journal_patterns, get_journals_by_date_range
- create_journal_template, get_journal_templates

#### Chat Tools (6 total)
- create_chat, get_chat, get_chat_history
- update_chat_name, delete_chat, search_chat_history

#### Memory Tools (10 total)
- create_memory, get_user_memories, get_memory, update_memory
- search_memories, get_memories_by_type, add_memory_tags
- remove_memory_tags, delete_memory, get_memory_stats

## Usage Examples

### Example 1: Journal Enhancement
When a user shares a journal entry, an AI agent can automatically enhance it:

**User sees**: "I've added some insights to help you reflect on this experience."

**Backend action**: 
```json
{
  "actions": [
    {
      "type": "journal_update",
      "journalId": "journal_123",
      "selectedText": "Today was hard.",
      "newText": "Today was hard. I notice this feeling often comes when I'm overwhelmed with tasks. Next time, I might try breaking things into smaller steps.",
      "operation": "replace"
    }
  ]
}
```

### Example 2: Pattern Analysis and Memory Creation
When analyzing multiple journals:

**User sees**: "I've noticed some interesting patterns in your emotional journey over the past month."

**Backend actions**:
```json
{
  "actions": [
    {
      "type": "journal_analysis",
      "journalIds": ["journal_123", "journal_124", "journal_125"],
      "analysisType": "mood"
    },
    {
      "type": "memory_creation",
      "memoryData": {
        "memoryType": "insight",
        "title": "Monthly Mood Pattern",
        "content": "User shows improved emotional regulation in week 3-4 of each month",
        "metadata": {"confidence": 0.9},
        "tags": ["mood", "pattern", "monthly"]
      }
    }
  ]
}
```

### Example 3: Bulk Journal Organization
When organizing multiple journal entries:

**User sees**: "I've organized your recent entries and added relevant tags."

**Backend action**:
```json
{
  "actions": [
    {
      "type": "bulk_journal_update",
      "updates": [
        {
          "id": "journal_123",
          "selectedText": "",
          "newText": "\n\n**Reflection**: This entry shows growth in self-awareness.",
          "operation": "append"
        }
      ]
    },
    {
      "type": "tag_management",
      "targetType": "journal",
      "targetId": "journal_123",
      "operation": "add",
      "tags": ["growth", "self-awareness"]
    }
  ]
}
```

## Backend Processing

1. **Response Processing**: The `processStructuredResponse()` function extracts structured data from agent responses
2. **Action Execution**: The `executeBackendActions()` function processes each action
3. **User Response**: Only the user-facing portion is shown to the frontend
4. **Action Results**: Internal logging tracks successful/failed actions
5. **Backward Compatibility**: Regular responses without structured data work normally

## Security & Validation

- Actions are only executed if user context is provided
- Journal IDs must be valid and belong to the authenticated user
- Selected text must exist in target journals
- All operations are logged for audit purposes
- Failed actions don't break the user experience

## Best Practices for AI Agents

1. **Be Selective**: Only use structured actions when they genuinely help the user
2. **Validate Data**: Ensure journal IDs and selected text are accurate
3. **User-Focused**: Keep the user response natural and helpful
4. **Safe Operations**: Prefer additions over replacements when possible
5. **Meaningful Actions**: Each action should serve a clear purpose

This system enables AI agents to be proactive assistants that not only provide advice but also help organize and enhance the user's data seamlessly.
