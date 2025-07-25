{
  "workflow": {
    "name": "Search-Analyze-Code-Report Pipeline",
    "version": "1.0",
    "agents": [
      {
        "name": "web_search_agent",
        "next": "analysis_agent",
        "config": {
          "tool_sets": ["think", "web_search", "crawl", "terminate", "planning"],
          "system_prompt_key": "web-search-prompt",
          "description": "Web Search Tool is a general-purpose internet retrieval assistant designed to gather information from the public internet. Core functions include: 1.Execute Search Queries: Perform queries against major search engines, returning a list of search results with titles, URLs, and content snippets; 2.Content Retrieval: Fetch the main content of specified public URLs, providing raw or cleaned HTML content; 3.Parameter Customization: Support for setting the number of search results and search engine preferences (where supported); 4.Information Retrieval: Deliver pure information retrieval service, presenting search results in a structured format for further processing. Limitations: 1)This tool does not analyze search results, synthesize information from multiple sources, or generate comprehensive reports; 2)Cannot access content behind paywalls, login screens, or bypass robots.txt restrictions; 3)Does not interact with web pages (e.g., filling forms, clicking buttons) - use browser_use_worker for such tasks; 4)Output is limited to search result listings or webpage content, intended for further processing or review; 5)Does not provide summaries of multiple articles or answers to complex questions requiring synthesis. This tool focuses on efficient web content retrieval, providing users with raw search data without content interpretation or summarization."
        }
      },
      {
        "name": "analysis_agent",
        "next": "coder_agent",
        "config": {
          "tool_sets": ["think", "file_read", "file_editor", "terminate", "planning"],
          "system_prompt_key": "analysis-prompt",
          "description": "This agent is specialized in data analysis and processing. Core capabilities include comprehensive data examination, statistical analysis, pattern recognition, and insight generation from structured and unstructured data sources. Key functions: 1)Advanced Data Processing: Clean, normalize, and transform raw data into structured formats suitable for analysis; 2)Statistical Analysis: Perform complex statistical computations, hypothesis testing, and quantitative analysis; 3)Pattern Recognition: Identify trends, correlations, and meaningful patterns in datasets; 4)Insight Generation: Extract actionable insights and key findings from analyzed data; 5)Data Validation: Verify data quality and ensure analytical accuracy. Limitations: 1)Does not collect new data - works exclusively with provided datasets; 2)Cannot generate formal reports or presentations; 3)No machine learning model training capabilities; 4)Does not make business recommendations; 5)Cannot perform real-time data analysis; 6)Limited to statistical and analytical processing without predictive modeling."
        }
      },
      {
        "name": "coder_agent",
        "next": "reporter_agent",
        "config": {
          "tool_sets": ["think", "web_search", "file_list", "file_read", "file_editor", "terminate", "planning", "edit_image", "generate_image"],
          "system_prompt_key": "coder-prompt",
          "description": "This worker is a **Frontend Web Specialist focused on building client-side web applications and interactive user interfaces using exclusively vanilla HTML, CSS, and JavaScript.** Its core responsibility is to translate design specifications and functional requirements into runnable, self-contained web code. It emphasizes creating lightweight, responsive, and performant solutions without relying on external frameworks or libraries. **CRITICAL LIMITATIONS:** 1) This worker **BUILDS FUNCTIONAL WEB APPLICATIONS/PAGES, NOT REPORTS OF ANY KIND.** When users request ANY type of report (including HTML reports, data reports, analysis reports, or summary reports), use the `reporter_worker` instead. This worker is ONLY for creating interactive web pages, applications, and user interfaces when users specifically request HTML/web pages WITHOUT mentioning reports. 2) It **DOES NOT** perform backend/server-side development or database interactions. 3) It **DOES NOT** utilize web frameworks (e.g., React, Angular, Vue) or common utility libraries (e.g., jQuery, Lodash). Only standard browser APIs are used. 4) It **DOES NOT** conduct research, data analysis, or content generation beyond placeholder text for UI elements. Its purpose is code generation based on provided specifications."
        }
      },
      {
        "name": "reporter_agent",
        "next": null,
        "config": {
          "tool_sets": ["file_list", "file_read", "file_editor", "think", "terminate", "planning", "edit_image", "generate_image"],
          "system_prompt_key": "reporter-prompt",
          "description": "This worker is **specialized in generating comprehensive narrative reports, summaries, and formal presentations of findings in ANY format including HTML reports.** Its SOLE RESPONSIBILITY is to synthesize existing data and analytical results (produced by other workers and available in the workspace) into a well-structured report. **CRITICAL ACTIVATION & OPERATING CONDITIONS:** 1) This worker MUST be used when users request ANY type of report (data reports, analysis reports, summary reports, HTML reports, etc.), regardless of the output format. 2) It **MUST NOT** be called until sufficient data has been collected and processed by other specialized workers. 3) This worker **DOES NOT** collect new data, perform data analysis, or execute code. It exclusively works with existing information and files within the workspace. 4) Its input is typically a directive to generate a report based on specified data or findings already gathered. 5) Output can be structured textual reports, executive summaries, HTML reports, or any other report format. Use this as the final step for presenting synthesized information in report form."
        }
      }
    ],
    "execution": {
      "sequential": true,
      "error_handling": {
        "retry_count": 3,
        "timeout": 300
      }
    }
  }
}