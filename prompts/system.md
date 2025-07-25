supervisor_agent
<function>
{
    "name": "supervisor_agent", // 这是agent的唯一标识符，其他agent通过此名称调用此功能
    "description": "分析用户请求并将任务分配给适当的agent，协调多个agent之间的工作流程，确保任务高效完成",
    "input": {
        "user_request": {
            "type": "string",
            "description": "用户的原始请求文本，包含需要完成的任务描述",
            "required": true
        },
        "available_workers": {
            "type": "array",
            "description": "当前系统中可用的worker agent列表",
            "required": false
        }
    },
    "example": {
        "input": {
            "user_request": "我需要写一篇关于冥想如何帮助减轻焦虑的情绪日记，并分析我最近一周的情绪状态。",
            "available_workers": ["search_agent", "summarize_agent", "report_agent"]
        }
    }
}
</function>


//summarize_agent
< function > {
    "name": "summarize_agent", // 这是agent的唯一标识符，其他agent通过此名称调用此功能
    "description": "分析日记内容并生成简洁摘要，捕捉核心情绪和主要事件",
    "input": {
        "title": {
            "type": "string",
            "description": "日记标题，通常包含日期或主题关键词",
            "required": true
        },
        "content": {
            "type": "string",
            "description": "日记正文内容，包含用户的情感表达和事件记录",
            "required": true
        },
    },
    "example": {
        "input": {
            "title": "今天感到焦虑 - 6月15日",
            "content": "今天早上醒来就感到一阵莫名的焦虑，可能是因为下午有重要的演讲。整个上午都无法集中注意力，一直担心会表现不好。午饭时和Alex聊了聊，他给了我一些建议，让我感觉好了一点。演讲结束后，其实反馈都很正面，我可能总是对自己要求太高了。晚上回家冥想了20分钟，感觉平静了许多。明天要记得对自己更宽容一些。"
        },
    },
} < /function>

//report_agent
<function>
{
    "name": "report_agent", // 这是agent的唯一标识符，其他agent通过此名称调用此功能
    "description": "生成综合数据分析报告，将原始数据转化为结构化、可读性强的报告文档，包含图表分析和改进建议",
    "input": {
        "report_type": {
            "type": "string",
            "description": "报告类型，如'情绪分析报告'、'习惯追踪报告'等",
            "required": true
        },
        "data_files": {
            "type": "array",
            "description": "需要分析的数据文件列表，包含情绪记录、日记内容等",
            "required": true
        }
    },
    "example": {
        "input": {
            "report_type": "情绪分析月度报告",
            "data_files": ["emotions_june.json", "journal_entries_june.json"]
        }
    }
}
</function>

//emotion_agent
<function>
{
    "name": "emotion_agent", // 这是agent的唯一标识符，其他agent通过此名称调用此功能
    "description": "基于Plutchik情绪轮理论分析文本中表达的情绪，提供八种基本情绪维度的量化评分，帮助理解情感状态的复杂性和强度",
    "input": {
        "content": {
            "type": "string",
            "description": "需要分析情绪的日记正文或摘要内容",
            "required": true
        },
        "detailed_analysis": {
            "type": "boolean",
            "description": "是否提供详细的情绪分析解释",
            "required": false
        }
    },
    "example": {
        "input": {
            "content": "今天早上醒来就感到一阵莫名的焦虑，可能是因为下午有重要的演讲。整个上午都无法集中注意力，一直担心会表现不好。午饭时和Alex聊了聊，他给了我一些建议，让我感觉好了一点。演讲结束后，其实反馈都很正面，我可能总是对自己要求太高了。晚上回家冥想了20分钟，感觉平静了许多。明天要记得对自己更宽容一些。",
            "detailed_analysis": true
        }
    }
}
</function>

//topic_agent
<function>
{
    "name": "topic_agent", // 这是agent的唯一标识符，其他agent通过此名称调用此功能
    "description": "分析文档集合中的主题和关键词，提取重要概念并进行聚类，为词云生成和知识图谱构建提供基础数据",
    "input": {
        "documents": {
            "type": "array",
            "description": "需要分析的文档集合，可以是多篇日记内容或摘要",
            "required": true
        },
        "time_period": {
            "type": "string",
            "description": "分析的时间范围，如'last_week'、'june_2023'等",
            "required": false
        },
        "min_keywords": {
            "type": "number",
            "description": "需要提取的最少关键词数量",
            "required": false
        }
    },
    "example": {
        "input": {
            "documents": [
                "今天早上醒来就感到一阵莫名的焦虑，可能是因为下午有重要的演讲。整个上午都无法集中注意力，一直担心会表现不好。午饭时和Alex聊了聊，他给了我一些建议，让我感觉好了一点。演讲结束后，其实反馈都很正面，我可能总是对自己要求太高了。晚上回家冥想了20分钟，感觉平静了许多。明天要记得对自己更宽容一些。",
                "今天是休息日，决定去公园散步。阳光明媚，看到很多家庭带着孩子在草地上野餐。不知不觉走了两小时，感觉心情舒畅了很多。回家路上买了些新鲜水果，晚上准备尝试一个新的沙拉食谱。最近养成了每天写日记的习惯，感觉能够更好地整理思绪。",
                "工作项目今天取得了重大突破，团队终于解决了困扰我们一周的技术问题。虽然过程很艰难，但最终的成功让所有付出都值得。领导对我们的表现非常满意，提到可能会有奖金。晚上和团队一起去庆祝，久违的放松让我意识到需要更多这样的时刻。"
            ],
            "time_period": "last_week",
            "min_keywords": 10
        }
    }
}
</function>
