# Query Test Configuration

## Environment Setup
Make sure you have the following environment variables set in your `.env` file:
- `MOONSHOT_API_KEY`: Your API key
- `MOONSHOT_BASE_URL`: API base URL (optional, defaults to https://api.moonshot.cn/v1)
- `LLM`: Model name (optional, defaults to kimi-k2-0711-preview)

## Usage

### 1. Run Predefined Test Cases
```bash
node utils/query_test.js
```

### 2. Run Custom Test
```bash
node utils/query_test.js "Your custom test message here"
```

### 3. Import and Use Programmatically
```javascript
import { testQuery, testQueryStream } from './utils/query_test.js';

// Test simple query
const result = await testQuery("What is AI?");

// Test streaming query with agent workflow
const streamResult = await testQueryStream("Analyze my mood and provide support");
```

## Test Cases Included

1. **Simple Question**: Basic AI question to test simple query functionality
2. **Journal Analysis**: Tests emotion analysis with mock journal data
3. **Complex Multi-Agent Task**: Tests the full agent workflow with productivity recommendations

## Output

The test will show:
- 📝 Input message
- 📄 Main LLM response 
- 📡 Stream events (workflow progress)
- 📝 Full streamed text
- ✅/❌ Success/failure status

## Understanding the Output

### Stream Events
- `initial_response_start`: LLM starts generating response
- `initial_response_complete`: Initial response done, starting agent workflow
- `workflow_started`: Supervisor agent begins analysis
- `iteration`: Supervisor coordinating agents (shows iteration count)
- `agent_selected`: Specific agent selected for task
- `monitoring`: Monitor agent evaluating response quality
- `retry_required`: Response needs improvement (satisfaction < 7)
- `agent_completed`: Agent task completed successfully
- `workflow_complete`: Entire agent workflow finished
- `workflow_error`: Error in agent workflow (falls back to initial response)

### Agent Workflow
The test demonstrates the full 4-step workflow:
1. Supervisor analyzes request and plans response
2. Supervisor selects and tasks appropriate agents
3. Monitor agent evaluates quality (satisfaction index)
4. Supervisor decides completion or continues iteration

## Troubleshooting

- **API Errors**: Check your API key and network connection
- **Agent Errors**: Review agent prompt files for syntax issues
- **Import Errors**: Ensure all dependencies are installed
- **Timeout Issues**: Increase timeout in query.js if needed
