import React from 'react';
import { motion } from 'framer-motion';
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
      items: ['Quantitative Finance', 'Backtesting', 'Risk Management']
    },
    {
      category: 'Data',
      items: ['Engineering', 'Science', 'Analysis', 'Architecture']
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 px-6 relative overflow-hidden"
    >
      <Background />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12"
        >
          About Me
        </motion.h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold">Background</h2>
            <p className="text-neutral-400 leading-relaxed">
              I'm a data scientist with a passion for uncovering insights through data analysis,
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
            <div className="grid gap-6">
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