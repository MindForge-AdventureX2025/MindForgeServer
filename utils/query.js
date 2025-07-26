import OpenAI from "openai";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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

// Agent workflow execution
async function executeAgentWorkflow(userMessage, res) {
    try {
        let currentMessage = userMessage;
        let workflowComplete = false;
        let iterationCount = 0;
        const maxIterations = 10; // Prevent infinite loops
        
        // Step 1: Start with supervisor agent
        res.write(`data: ${JSON.stringify({ 
            status: 'workflow_started', 
            message: 'Supervisor agent analyzing request...' 
        })}\n\n`);
        
        let supervisorResponse = await runAgent('supervisor', currentMessage);
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
                message: 'Supervisor coordinating agents...' 
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
                    message: `${selectedAgent} agent processing task...` 
                })}\n\n`);
                
                // Execute the selected agent
                const agentResponse = await runAgent(selectedAgent, `${agentContext}\n\nTask: ${agentTask}`);
                
                // Step 3: Monitor agent evaluates the response
                res.write(`data: ${JSON.stringify({ 
                    status: 'monitoring', 
                    message: 'Monitor agent evaluating response quality...' 
                })}\n\n`);
                
                const monitorResponse = await runAgent('monitor', 
                    `Agent: ${selectedAgent}\nTask: ${agentTask}\nResponse: ${agentResponse}\n\nEvaluate this response and provide satisfaction index (1-10). If satisfaction < 7, provide improvement feedback.`
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
                        message: 'Response quality insufficient, requesting improvement...' 
                    })}\n\n`);
                    
                    const improvementFeedback = monitorData?.feedback || 'Please improve the response quality and completeness.';
                    const improvedResponse = await runAgent(selectedAgent, 
                        `${agentContext}\n\nTask: ${agentTask}\n\nPrevious Response: ${agentResponse}\n\nImprovement Needed: ${improvementFeedback}\n\nPlease provide an improved response.`
                    );
                    
                    // Send improved response back to supervisor
                    supervisorResponse = await runAgent('supervisor', 
                        `Previous Plan: ${JSON.stringify(supervisorData)}\n\nAgent: ${selectedAgent}\nCompleted Task: ${agentTask}\nFinal Response: ${improvedResponse}\n\nEvaluate mission completion and decide next steps.`
                    );
                } else {
                    // Step 4: Send successful response back to supervisor
                    res.write(`data: ${JSON.stringify({ 
                        status: 'agent_completed', 
                        agent: selectedAgent,
                        satisfaction: satisfactionScore,
                        message: 'Agent task completed successfully' 
                    })}\n\n`);
                    
                    supervisorResponse = await runAgent('supervisor', 
                        `Previous Plan: ${JSON.stringify(supervisorData)}\n\nAgent: ${selectedAgent}\nCompleted Task: ${agentTask}\nResponse: ${agentResponse}\n\nEvaluate mission completion and decide next steps.`
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
            message: 'Workflow error occurred, falling back to direct response' 
        })}\n\n`);
        
        // Fallback to direct LLM response
        return await directLLMResponse(userMessage);
    }
}

// Helper function to run individual agents
async function runAgent(agentName, message) {
    try {
        const agent = agents[agentName];
        if (!agent) {
            throw new Error(`Agent ${agentName} not found`);
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
        
        const response = await client.chat.completions.create({
            model: "kimi-k2-0711-preview",
            messages: [
                {
                    role: "system",
                    content: agentPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
        });
        
        return response.choices[0].message.content;
        
    } catch (error) {
        console.error(`Error running agent ${agentName}:`, error);
        return `Agent ${agentName} encountered an error. Please try again.`;
    }
}

// Direct LLM response for fallback
async function directLLMResponse(message) {
    const response = await client.chat.completions.create({
        model: "kimi-k2-0711-preview",
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
            model: "kimi-k2-0711-preview",
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

export const queryStream = async (message, res) => {
    try {
        let fullText = "";
        
        // First, provide the initial response via streaming
        res.write(`data: ${JSON.stringify({ 
            status: 'initial_response_start', 
            message: 'Generating initial response...' 
        })}\n\n`);
        
        const stream = await client.chat.completions.create({
            model: "kimi-k2-0711-preview",
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
            message: 'Initial response completed. Starting agent workflow...' 
        })}\n\n`);

        // After initial response is complete, run the agent workflow
        try {
            const agentWorkflowResult = await executeAgentWorkflow(message, res);
            
            // Send the enhanced response from agent workflow
            res.write(`data: ${JSON.stringify({ 
                status: 'workflow_complete',
                enhanced_response: agentWorkflowResult,
                message: 'Agent workflow completed successfully' 
            })}\n\n`);
            
            // Return the original response for now, enhanced response is sent via stream
            return fullText;
            
        } catch (workflowError) {
            console.error("Agent workflow error:", workflowError);
            res.write(`data: ${JSON.stringify({ 
                status: 'workflow_error',
                error: workflowError.message,
                message: 'Agent workflow encountered an error, using initial response' 
            })}\n\n`);
            
            return fullText;
        }

    } catch (error) {
        console.error("Error in queryStream function:", error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        return "An error occurred while processing your request.";
    }
};