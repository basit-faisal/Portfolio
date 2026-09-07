export type Project = {
  title: string;
  description: string;
  /** Shown as the file "type" in the retro list view. */
  kind: string;
};

export const projects: Project[] = [
  {
    title: 'USDOT Webscraper',
    description: 'Automated data extraction system for transportation insights',
    kind: 'Data Engineering'
  },
  {
    title: 'Crypto Coin Dashboard',
    description: 'Real-time cryptocurrency monitoring and analytics platform',
    kind: 'Dashboard'
  },
  {
    title: 'NASA Analytics WebPlatform',
    description: 'Full-stack FastAPI + React platform processing NASA open data in PySpark',
    kind: 'Big Data'
  },
  {
    title: 'Agentic RAG Chatbots',
    description: 'Advanced AI-powered chatbots with retrieval augmented generation',
    kind: 'AI / LLM'
  },
  {
    title: 'Live Crypto Trading Algorithms',
    description: 'Automated trading systems for cryptocurrency markets',
    kind: 'Quant'
  },
  {
    title: 'Marketing Automation',
    description: 'End-to-end marketing workflow automation solution',
    kind: 'Automation'
  },
  {
    title: 'Leads Generation SaaS',
    description: 'B2B lead generation and qualification platform',
    kind: 'SaaS'
  },
  {
    title: 'Implied Volatility via Black-Scholes',
    description: 'Options pricing and Cost of Carry accuracy testing on S&P 500 EOD data',
    kind: 'Quant'
  },
  {
    title: 'Stock Sentiment Analysis',
    description: 'FinBERT-powered Streamlit app scoring scraped market news for traders',
    kind: 'AI / LLM'
  },
  {
    title: 'POS & Desktop Software',
    description: 'Suite of business management and point-of-sale solutions',
    kind: 'Desktop'
  },
  {
    title: 'Fraud Detection ML',
    description: 'Machine learning system for detecting fraudulent transactions',
    kind: 'Machine Learning'
  },
  {
    title: 'Client Retention ML',
    description: 'Predictive analytics for customer churn prevention',
    kind: 'Machine Learning'
  },
  {
    title: 'Neural Networks From Scratch',
    description: 'Custom neural network framework built from fundamental principles',
    kind: 'Machine Learning'
  },
  {
    title: 'GIKI Navigator',
    description: "Dijkstra and BFS shortest-path desktop app mapping a university campus with Folium",
    kind: 'Desktop'
  }
];
