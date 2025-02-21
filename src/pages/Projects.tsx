import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import Background from '../components/Background';

const Projects = () => {
  const projects = [
    {
      title: 'USDOT Webscraper',
      description: 'Automated data extraction system for transportation insights',
      image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&q=80',
    },
    {
      title: 'Crypto Coin Dashboard',
      description: 'Real-time cryptocurrency monitoring and analytics platform',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    },
    {
      title: 'NASA Analytics WebPlatform',
      description: 'Interactive dashboard for space mission data visualization',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    },
    {
      title: 'Agentic RAG Chatbots',
      description: 'Advanced AI-powered chatbots with retrieval augmented generation',
      image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80',
    },
    {
      title: 'Live Crypto Trading Algorithms',
      description: 'Automated trading systems for cryptocurrency markets',
      image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80',
    },
    {
      title: 'Marketing Automation',
      description: 'End-to-end marketing workflow automation solution',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    },
    {
      title: 'Leads Generation SaaS',
      description: 'B2B lead generation and qualification platform',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    },
    {
      title: 'Black-Scholes Model Implementation S&P 500',
      description: 'Options pricing and risk analysis tool for S&P 500',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    },
    {
      title: 'POS & Other Desktop Softwares',
      description: 'Suite of business management and point-of-sale solutions',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    },
    {
      title: 'Fraud Detection ML Implementation',
      description: 'Machine learning system for detecting fraudulent transactions',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    },
    {
      title: 'Client Retention ML Implementation',
      description: 'Predictive analytics for customer churn prevention',
      image: 'https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=800&q=80',
    },
    {
      title: 'Neural Networks Implementation From Scratch',
      description: 'Custom neural network framework built from fundamental principles',
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 px-6 relative overflow-hidden"
    >
      <Background />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-12"
        >
          Projects
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-neutral-400 mb-4">{project.description}</p>
                <a
                  href="/contact"
                  className="inline-flex items-center space-x-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <span>Want to know more? Contact Me!</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Projects