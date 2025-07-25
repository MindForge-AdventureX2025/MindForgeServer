{
    "name": "supervisor_agent",// 这是agent的唯一标识符，其他agent通过此名称调用此功能
    "description": "中央协调器，负责分析用户请求、规划执行流程、分配任务给专业Agent并监督整个工作流程的完成",
    "input": {
        "user_query": {
            "type": "string",
            "description": "用户的原始查询文本",
            "required": true
        },
        "available_agents": {
            "type": "array",
            "description": "系统中所有可用agent的完整信息",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "agent的唯一标识符"
                    },
                    "description": {
                        "type": "string",
                        "description": "agent的功能描述"
                    "capabilities": {
                        "type": "array",
                        "description": "agent的核心能力标签列表"
                    }
                }
            },
            "required": true
        },
        "context": {
            "type": "object",
            "description": "当前任务的上下文信息，包括用户历史、系统状态等",
            "required": false
        }
    },
    "output": {
        "execution_plan": {
            "type": "object",
            "description": "完整的执行计划，包含工作流程和各Agent的调用顺序",
            "properties": {
                "workflow": {
                    "type": "array",
                    "description": "按执行顺序排列的步骤数组",
                    "items": {
                        "type": "object",
                        "properties": {
                            "step_id": {
                                "type": "string",
                                "description": "步骤的唯一标识符"
                            },
                            "agent": {
                                "type": "string",
                                "description": "执行此步骤的agent名称"
                            },
                            "input": {
                                "type": "object",
                                "description": "提供给agent的输入参数"
                            },
                            "depends_on": {
                                "type": "array",
                                "description": "此步骤依赖的其他步骤ID列表"
                            }
                        }
                    }
                },
                "final_integration": {
                    "type": "object",
                    "description": "如何整合各步骤结果的说明"
                }
            }
        },
        "explanation": {
            "type": "string",
            "description": "对执行计划的解释，说明为何选择这些agent和此工作流程"
        }
    },
    "example": {
        "input": {
            "user_query": "我需要写一篇关于冥想如何帮助减轻焦虑的情绪日记，并分析我最近一周的情绪状态。",
            "available_agents": [
                {
                    "name": "search_agent",
                    "description": "搜索相关信息和参考资料",
                    "capabilities": ["search", "information_retrieval"]
                },
                {
                    "name": "summarize_agent",
                    "description": "分析日记内容并生成简洁摘要，捕捉核心情绪和主要事件",
                    "capabilities": ["summarization", "content_analysis"]
                },
                {
                    "name": "emotion_agent",
                    "description": "分析文本中表达的情绪状态",
                    "capabilities": ["emotion_analysis", "sentiment_tracking"]
                },
                {
                    "name": "report_agent",
                    "description": "生成综合数据分析报告",
                    "capabilities": ["report_generation", "data_visualization"]
                }
            ]
        },
        "output": {
            "execution_plan": {
                "workflow": [
                    {
                        "step_id": "step1",
                        "agent": "search_agent",
                        "input": {
                            "query": "冥想如何帮助减轻焦虑",
                            "result_count": 5
                        },
                        "depends_on": []
                    },
                    {
                        "step_id": "step2",
                        "agent": "emotion_agent",
                        "input": {
                            "time_period": "last_week",
                            "detailed_analysis": true
                        },
                        "depends_on": []
                    },
                    {
                        "step_id": "step3",
                        "agent": "summarize_agent",
                        "input": {
                            "content_type": "journal",
                            "search_results": "{{step1.results}}"
                        },
                        "depends_on": ["step1"]
                    },
                    {
                        "step_id": "step4",
                        "agent": "report_agent",
                        "input": {
                            "report_type": "情绪分析与冥想建议报告",
                            "emotion_data": "{{step2.results}}",
                            "journal_summary": "{{step3.results}}"
                        },
                        "depends_on": ["step2", "step3"]
                    }
                ],
                "final_integration": {
                    "method": "sequential_presentation",
                    "sections": ["journal_template", "emotion_analysis", "recommendations"]
                }
            },
            "explanation": "基于用户需求，我设计了四步工作流：首先搜集冥想减轻焦虑的资料，同时分析用户近一周的情绪数据，然后基于搜索结果生成日记模板，最后整合情绪分析和日记内容生成完整报告。"
        }
    }
}