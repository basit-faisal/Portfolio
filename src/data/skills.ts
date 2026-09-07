import type { PixelIconName } from '../retro/PixelIcon';

export type Skill = {
  name: string;
  icon: PixelIconName;
};

export type SkillGroup = {
  category: string;
  items: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    category: 'Development',
    items: [
      { name: 'FastAPI', icon: 'server' },
      { name: 'PySpark', icon: 'cluster' },
      { name: 'Airflow', icon: 'flow' },
      { name: 'Grafana/Prometheus', icon: 'gauge' },
      { name: 'SQL', icon: 'database' },
      { name: 'Snowflake', icon: 'snowflake' },
      { name: 'dbt', icon: 'dbt' }
    ]
  },
  {
    category: 'AI & ML',
    items: [
      { name: 'Machine Learning', icon: 'network' },
      { name: 'Deep Learning', icon: 'layers' },
      { name: 'LLMs', icon: 'chat' },
      { name: 'NLP', icon: 'document' }
    ]
  },
  {
    category: 'Finance',
    items: [
      { name: 'Quantitative Analysis', icon: 'chartLine' },
      { name: 'Risk Management', icon: 'shield' },
      { name: 'Portfolio Theory', icon: 'pie' },
      { name: 'Financial Modeling', icon: 'calculator' }
    ]
  },
  {
    category: 'Visualizations',
    items: [
      { name: 'Hex', icon: 'hex' },
      { name: 'Tableau', icon: 'tableau' },
      { name: 'Power BI', icon: 'powerBi' },
      { name: 'Looker', icon: 'looker' }
    ]
  }
];
