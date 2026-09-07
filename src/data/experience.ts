export type Role = {
  position: string;
  period: string;
  points: string[];
};

export type Experience = {
  company: string;
  period: string;
  technologies: string[];
  roles: Role[];
};

export const experiences: Experience[] = [
  {
    company: 'Motive',
    period: 'June 2025 - Current',
    roles: [
      {
        position: 'Data Quality Analyst',
        period: 'October 2025 - Current',
        points: [
          'Operated and monitored recurring dbt pipeline runs through Paradime/Bolt, including dependency setup and production outreach-sync models, helping keep GTM data production-ready.',
          'Improved Salesforce contactability-data coverage by coordinating batched loads, validating results, and reconciling downstream records against source outputs.',
          'Built and tested data-quality automation for account-hierarchy workflows and improved title classification with bounded, case-insensitive regex logic while preserving exclusions and reducing false positives.',
          'Improved account-website enrichment by refining candidate validation logic and coordinating the workflow to populate missing Salesforce websites from Snowflake.',
          'Designed an on-demand Airflow/Kubernetes pipeline pattern that reads reviewed Snowflake data in bounded batches, processes results in memory, and writes audit-ready output to a permanent table with retry and idempotency considerations.',
          'Contributed to Hex analytics migration and dashboard validation by reviewing Snowflake-backed queries and documenting deployment considerations for downstream analytics.'
        ]
      },
      {
        position: 'Data Quality Specialist',
        period: 'June 2025 - October 2025',
        points: [
          'Scraped hundreds of websites to source ideal client data, with potential to add hundreds of thousands of dollars (if not millions) in company revenue.',
          'Built internal tools to automate repetitive tasks and significantly improve team efficiency.',
          'Used cosine similarity and fuzzy logic for industry classification (Food and Beverage) to support more efficient marketing campaigns.',
          'Built waterfalls and program flows on Clay to enrich data via Clay\u2019s agentic navigator.',
          'Used Ollama to classify data into required categories automatically, reducing API costs and improving data quality.',
          'Created reporting queries for the enrichment team to track data quality percentages on key fields and inform quarterly decisions.',
          'Built Google Sheets macros to parse messy address data into state, city, and zip without paid tools or AI, cutting cost and turnaround time.',
          'Enriched data using deep research tools and custom deep-research apps on Gemini and Perplexity.',
          'Implemented hypothesis testing on vendor data against other sources, using conditional probability to evaluate vendors.'
        ]
      }
    ],
    technologies: ['dbt', 'Paradime', 'Airflow', 'Kubernetes', 'Snowflake', 'Salesforce', 'Hex', 'Python', 'SQL', 'Clay', 'Ollama', 'Google Sheets', 'LLMs', 'Statistical Analysis']
  },
  {
    company: 'DAO PropTech',
    period: 'January 2025 - May 2025',
    roles: [
      {
        position: 'Junior Data Scientist',
        period: 'January 2025 - May 2025',
        points: [
          'Built agentic RAG chatbots with Milvus (Lite and Standalone), LangChain, and OpenAI, including chunking strategies, multi-source integration, and CI/CD for fast updates.',
          'Created observability dashboards in Grafana and Prometheus for a unified view of metrics across deployed applications.',
          'Developed and planned an end-to-end ETL pipeline to support the company\u2019s data needs.',
          'Applied hypothesis testing to support research and product decisions.'
        ]
      }
    ],
    technologies: ['Milvus', 'LangChain', 'OpenAI', 'RAG', 'Grafana', 'Prometheus', 'ETL', 'CI/CD']
  },
  {
    company: 'S&P Global',
    period: 'June 2024 - September 2024',
    roles: [
      {
        position: 'Data Governance Intern (Market Intelligence)',
        period: 'June 2024 - September 2024',
        points: [
          'Generated stock market index descriptions from index keys using a fine-tuned LLM and prompt engineering in Python.',
          'Built an index standardization POC that automated index search and retrieval with SQL and Python, including a brute-force search algorithm and caching.',
          'Built DataSentinel, a data governance POC that validates metadata datasets and scores quality for data producers, using regex-based checks plus a fine-tuned NER model (spaCy) to highlight errors.'
        ]
      }
    ],
    technologies: ['Python', 'SQL', 'spaCy', 'NER', 'Prompt Engineering', 'GCP', 'Data Governance']
  },
  {
    company: 'Citi',
    period: 'June 2023 - August 2023',
    roles: [
      {
        position: 'Summer Data Analyst (Securities & Services Division)',
        period: 'June 2023 - August 2023',
        points: [
          'Worked on tax reports and automated tax reporting processes.',
          'Built dynamic Excel dashboards and forms with VBA for accurate tracking.',
          'Conducted industry-wise qualitative analysis and refined datasets to support investment and portfolio work.'
        ]
      }
    ],
    technologies: ['Excel', 'VBA', 'Tax Reporting', 'Data Analysis', 'Dynamic Dashboards']
  },
  {
    company: 'Bank of Punjab',
    period: 'May 2023 - June 2023',
    roles: [
      {
        position: 'Data Science Intern (Management Information Services)',
        period: 'May 2023 - June 2023',
        points: [
          'Worked with the Management Information Services (MIS) team.',
          'Learned banking procedures and executed SQL queries to support other teams.',
          'Applied financial concepts (CWI, SLA, and others) in day-to-day work.'
        ]
      }
    ],
    technologies: ['SQL', 'MIS', 'Banking Procedures', 'Data Analysis']
  }
];
