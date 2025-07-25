import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import Background from '../components/Background';

const WorkHistory = () => {
  const experiences = [
    {
      company: 'DAO PropTech',
      position: 'Junior Data Scientist',
      period: 'January 2025 - Current',
      description: 'Developed a RAG chatbot using Milvus vector database and OpenAI\'s LLM, creating an agentic solution for customer engagement.',
      technologies: ['Milvus', 'OpenAI', 'RAG', 'Bayesian Statistics','Grafana','Prometheus']
    },
    {
      company: 'S&P GLOBAL',
      position: 'Data Governance Intern (Market Intelligence)',
      period: 'June 2024 - September 2024',
      description: 'Enhanced data integrity through Python scripts on GCP, validated datasets and improved generation efficiency for S&P index descriptions. Optimized stakeholder decision-making by designing real-time tracking dashboards and standardized index retrieval by integrating Bloomberg naming conventions.',
      technologies: ['Python', 'GCP', 'Bloomberg', 'Data Governance','LLM (Meta NLLB)']
    },
    {
      company: 'CITI Bank',
      position: 'Summer Data Analyst (Securities & Services Division)',
      period: 'June 2023 - August 2023',
      description: 'Developed investment models and improved portfolio returns. Created investment processing systems and refined datasets. Implemented accurate tracking using Excel Dashboards and automated tax reporting processes.',
      technologies: ['Investment Modeling', 'Excel', 'Data Analysis', 'Process Automation','Dynamic Dashboards']
    },
    {
      company: 'Bank of Punjab',
      position: 'Intern (Management Information Systems)',
      period: 'April 2023 - June 2023',
      description: 'Led cross-functional teams to launch and market new products globally. Drove company objectives and boosted operational efficiency through SQL queries for data-driven decisions.',
      technologies: ['SQL', 'Team Leadership', 'Product Management', 'Data Analysis']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 md:pt-24 px-6 relative overflow-hidden"
    >
      <Background />

      <div className="max-w-4xl mx-auto relative z-10 pb-24">
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12"
        >
          Work History
        </motion.h1>

        <div className="space-y-12">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.company}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="absolute -left-3 top-6">
                <div className="bg-neutral-800 rounded-full p-2">
                  <Building2 className="w-5 h-5 text-neutral-300" />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{experience.company}</h2>
                  <h3 className="text-lg text-neutral-400">{experience.position}</h3>
                </div>
                <span className="text-sm text-neutral-500 mt-2 md:mt-0">{experience.period}</span>
              </div>
              
              <p className="text-neutral-300 mb-4 leading-relaxed">{experience.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-neutral-800/50 px-3 py-1.5 rounded-full text-sm text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WorkHistory; 