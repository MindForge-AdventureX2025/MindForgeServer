import { Agent, run } from "@openai/agents";

export const supervisor_agent = new Agent({
    name: 'supervisor',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const retrieval_agent = new Agent({
    name: 'retrieval',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const summarization_agent = new Agent({
    name: 'summarization',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const tags_agent = new Agent({
    name: 'tags',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const enhancement_agent = new Agent({
    name: 'enhancement',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const memory_agent = new Agent({
    name: 'memory',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const report_agent = new Agent({
    name: 'report',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})

export const monitor_agent = new Agent({
    name: 'monitor',
    instructions: '',
    model: 'kimi-k2-0711-preview',
})