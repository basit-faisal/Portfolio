import React from 'react';
import { motion } from 'framer-motion';
import Background from '../components/Background';

const About = () => {
  const skills = [
    'React', 'TypeScript', 'Node.js', 'Tailwind CSS',
    'UI/UX Design', 'Next.js', 'GraphQL', 'AWS'
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
          className="text-4xl md:text-5xl font-bold mb-8"
        >
          About Me
        </motion.h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Background</h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
              I'm a full-stack developer with a passion for creating beautiful,
              functional, and user-friendly websites and applications. With over
              5 years of experience in web development, I've worked with clients
              from startups to enterprise companies.
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
          >
            <h2 className="text-2xl font-semibold mb-4">Skills</h2>
            <div className="grid grid-cols-2 gap-4">
              {skills.map((skill, index) => (
                <div
                  key={skill}
                  className="bg-neutral-900/50 backdrop-blur-sm p-4 rounded-lg text-center"
                >
                  {skill}
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