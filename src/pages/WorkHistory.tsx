import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import Background from '../components/Background';

const WorkHistory = () => {
  const experiences = [
    {
      company: 'Company Name 1',
      position: 'Senior Position',
      period: '2022 - Present',
      description: 'Description of your responsibilities and achievements.',
      technologies: ['Tech1', 'Tech2', 'Tech3']
    },
    {
      company: 'Company Name 2',
      position: 'Previous Position',
      period: '2020 - 2022',
      description: 'Description of your responsibilities and achievements.',
      technologies: ['Tech1', 'Tech2', 'Tech3']
    },
    // Add more work experiences as needed
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
          Work History
        </motion.h1>

        <div className="space-y-12">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.company}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 border-l border-neutral-800"
            >
              <div className="absolute -left-3 top-0">
                <Building2 className="w-6 h-6 text-neutral-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-1">{experience.company}</h2>
              <h3 className="text-lg text-neutral-400 mb-2">
                {experience.position} • {experience.period}
              </h3>
              <p className="text-neutral-300 mb-4">{experience.description}</p>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="bg-neutral-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm"
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