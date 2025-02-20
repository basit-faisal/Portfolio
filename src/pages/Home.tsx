import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Background from '../components/Background';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
    >
      <Background />

      <div className="max-w-4xl relative z-10">
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <div className="flex flex-col gap-2">
            <span>Data Engineer</span>
            <span className="text-neutral-400">&</span>
            <span>Quant Enthusiast</span>
          </div>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-400 text-lg md:text-xl mb-8 max-w-2xl"
        >
          Transforming complex data into actionable insights. Specializing in
          quantitative analysis, machine learning, and financial modeling.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="/projects"
            className="inline-flex items-center space-x-2 text-lg 
              border border-neutral-400 px-6 py-3 rounded-full 
              hover:border-neutral-100 hover:bg-gradient-to-r 
              hover:from-neutral-900 hover:to-neutral-800
              hover:text-neutral-100 hover:-translate-y-0.5 
              transition-all duration-300 ease-out
              hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <span>View Projects</span>
            <ArrowRight size={20} />
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;