import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import Background from '../components/Background';

const About = () => {
  const skills = [
    {
      category: 'Development',
      items: ['FastAPI', 'PySpark', 'Airflow', 'Grafana/Prometheus']
    },
    {
      category: 'AI & ML',
      items: ['Machine Learning', 'Deep Learning', 'LLMs', 'NLP']
    },
    {
      category: 'Finance',
      items: ['Quantitative Analysis', 'Risk Management', 'Portfolio Theory', 'Financial Modeling']
    },
    {
      category: 'Data',
      items: ['SQL', 'Data Engineering', 'Data Analysis', 'Data Visualization']
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="space-y-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-start">
              <h1 className="text-4xl md:text-5xl font-bold mb-8">About Me</h1>
              <a
                href="/Portfolio/Basit_Faisal_Resume.pdf"
                download
                className="inline-flex items-center space-x-2 text-lg 
                  border border-neutral-400 px-6 py-3 rounded-full 
                  hover:border-neutral-100 hover:bg-gradient-to-r 
                  hover:from-neutral-900 hover:to-neutral-800
                  hover:text-neutral-100 hover:-translate-y-0.5 
                  transition-all duration-300 ease-out
                  hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <span>Download Resume</span>
                <Download size={20} />
              </a>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              I'm someone passionate about uncovering insights through data analysis,
              machine learning, and algorithmic trading. With a strong background in financial
              data science, I specialize in building data-driven solutions for multiple domains.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              My approach combines technical expertise with creative problem-solving,
              ensuring that every project not only meets but exceeds expectations.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-semibold">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map(({ category, items }) => (
                <div key={category}>
                  <h3 className="text-neutral-300 text-sm uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill}
                        className="bg-neutral-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default About
