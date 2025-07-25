{
    "name": "supervisor_agent",
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
                    },
                    "capabilities": {
                        "type": "array",
                        "description": "agent的核心能力标签列表"
                    },
                    "input_schema": {
                        "type": "object",
                        "description": "agent接受的输入参数结构"
                    },
                    "output_schema": {
                        "type": "object",
                        "description": "agent返回的输出结构"
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
                            "middleware": {
                                "type": "object",
                                "description": "用于转换前一步骤输出到当前步骤输入的中间件配置",
                                "properties": {
                                    "input_mapping": {
                                        "type": "object",
                                        "description": "定义如何将前置步骤的输出字段映射到当前步骤的输入字段"
                                    },
                                    "transformations": {
                                        "type": "array",
                                        "description": "需要应用的数据转换操作列表",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "type": {
                                                    "type": "string",
                                                    "description": "转换类型，如format_change, filter, enrich等"
                                                },
                                                "source_field": {
                                                    "type": "string",
                                                    "description": "源数据字段"
                                                },
                                                "target_field": {
                                                    "type": "string",
                                                    "description": "目标数据字段"
                                                },
                                                "config": {
                                                    "type": "object",
                                                    "description": "转换的具体配置"
                                                }
                                            }
                                        }
                                    }
                                }
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
                    "capabilities": ["search", "information_retrieval"],
                    "input_schema": {
                        "query": {
                            "type": "string",
                            "description": "搜索查询"
                        },
                        "result_count": {
                            "type": "number",
                            "description": "返回结果数量"
                        }
                    },
                    "output_schema": {
                        "results": {
                            "type": "array",
                            "description": "搜索结果列表",
                            "items": {
                                "title": {
                                    "type": "string",
                                    "description": "结果标题"
                                },
                                "content": {
                                    "type": "string",
                                    "description": "结果内容"
                                },
                                "source": {
                                    "type": "string",
                                    "description": "来源"
                                }
                            }
                        }
                    }
                },
                {
                    "name": "summarize_agent",
                    "description": "分析日记内容并生成简洁摘要，捕捉核心情绪和主要事件",
                    "capabilities": ["summarization", "content_analysis"],
                    "input_schema": {
                        "content_type": {
                            "type": "string",
                            "description": "内容类型，如journal, article等"
                        },
                        "content": {
                            "type": "string",
                            "description": "需要总结的内容"
                        },
                        "search_results": {
                            "type": "array",
                            "description": "参考资料搜索结果"
                        }
                    },
                    "output_schema": {
                        "summary": {
                            "type": "string",
                            "description": "内容摘要"
                        },
                        "key_points": {
                            "type": "array",
                            "description": "关键点列表"
                        },
                        "emotion_keywords": {
                            "type": "array",
                            "description": "情绪关键词"
                        }
                    }
                },
                {
                    "name": "emotion_agent",
                    "description": "分析文本中表达的情绪状态",
                    "capabilities": ["emotion_analysis", "sentiment_tracking"],
                    "input_schema": {
                        "content": {
                            "type": "string",
                            "description": "需要分析情绪的文本内容"
                        },
                        "time_period": {
                            "type": "string",
                            "description": "分析时间段，如last_week, last_month等"
                        },
                        "detailed_analysis": {
                            "type": "boolean",
                            "description": "是否生成详细分析"
                        }
                    },
                    "output_schema": {
                        "primary_emotion": {
                            "type": "string",
                            "description": "主要情绪"
                        },
                        "emotion_scores": {
                            "type": "object",
                            "description": "各种情绪的量化分数"
                        },
                        "trend_analysis": {
                            "type": "object",
                            "description": "情绪趋势分析"
                        },
                        "detailed_report": {
                            "type": "string",
                            "description": "详细的情绪分析报告"
                        }
                    }
                },
                {
                    "name": "report_agent",
                    "description": "生成综合数据分析报告",
                    "capabilities": ["report_generation", "data_visualization"],
                    "input_schema": {
                        "report_type": {
                            "type": "string",
                            "description": "报告类型"
                        },
                        "emotion_data": {
                            "type": "object",
                            "description": "情绪分析数据"
                        },
                        "journal_summary": {
                            "type": "object",
                            "description": "日记摘要"
                        }
                    },
                    "output_schema": {
                        "report": {
                            "type": "object",
                            "description": "生成的报告",
                            "properties": {
                                "title": {
                                    "type": "string",
                                    "description": "报告标题"
                                },
                                "sections": {
                                    "type": "array",
                                    "description": "报告各部分内容"
                                },
                                "visualizations": {
                                    "type": "array",
                                    "description": "数据可视化图表"
                                },
                                "recommendations": {
                                    "type": "array",
                                    "description": "建议列表"
                                }
                            }
                        }
                    }
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
                        }
                    },
                    {
                        "step_id": "step2",
                        "agent": "emotion_agent",
                        "input": {
                            "time_period": "last_week",
                            "detailed_analysis": true
                        }
                    },
                    {
                        "step_id": "step3",
                        "agent": "summarize_agent",
                        "input": {
                            "content_type": "journal",
                            "search_results": "{{step1.results}}"
                        },
                        "middleware": {
                            "input_mapping": {
                                "search_results": "step1.results"
                            },
                            "transformations": [
                                {
                                    "type": "format_change",
                                    "source_field": "results",
                                    "target_field": "search_results",
                                    "config": {
                                        "flatten_structure": true,
                                        "extract_content_only": false
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "step_id": "step4",
                        "agent": "report_agent",
                        "input": {
                            "report_type": "情绪分析与冥想建议报告",
                            "emotion_data": "{{step2.results}}",
                            "journal_summary": "{{step3.results}}"
                        },
                        "middleware": {
                            "input_mapping": {
                                "emotion_data": "step2.results",
                                "journal_summary": "step3.results"
                            },
                            "transformations": [
                                {
                                    "type": "merge",
                                    "source_field": ["primary_emotion", "emotion_scores", "trend_analysis"],
                                    "target_field": "emotion_data",
                                    "config": {
                                        "structure": "nested_object"
                                    }
                                },
                                {
                                    "type": "format_change",
                                    "source_field": "summary",
                                    "target_field": "journal_summary.content",
                                    "config": {}
                                },
                                {
                                    "type": "format_change", 
                                    "source_field": "key_points",
                                    "target_field": "journal_summary.highlights",
                                    "config": {}
                                }
                            ]
                        }
                    }
                ],
                "final_integration": {
                    "method": "sequential_presentation",
                    "sections": ["journal_template", "emotion_analysis", "recommendations"]
                }
            },
            "explanation": "基于用户需求，我设计了四步工作流：首先搜集冥想减轻焦虑的资料，同时分析用户近一周的情绪数据，然后基于搜索结果生成日记模板，最后整合情绪分析和日记内容生成完整报告。各步骤之间通过中间件处理数据格式转换，确保数据能顺利流转。"
        }
    }
}