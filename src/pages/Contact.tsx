import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import Background from '../components/Background';
import { Scene3D } from '../components/Scene3D';

const Contact = () => {
  const socialLinks = [
    { icon: Github, label: 'GitHub', href: 'https://github.com/basit-faisal' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/basitfaisal/' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 md:pt-24 px-6 relative overflow-hidden"
    >
      <Background />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              Let's Connect
            </h1>
            
            <p className="text-lg text-neutral-300">
              I'm always open to new opportunities and interesting projects.
              Whether you have a question or just want to say hi, I'll try
              my best to get back to you!
            </p>

            <a
              href="mailto:basitfaisal03@gmail.com"
              className="inline-flex items-center space-x-2 text-lg 
                border border-neutral-400 px-6 py-3 rounded-full 
                hover:border-neutral-100 hover:bg-gradient-to-r 
                hover:from-neutral-900 hover:to-neutral-800
                hover:text-neutral-100 hover:-translate-y-0.5 
                transition-all duration-300 ease-out
                hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Mail size={20} />
              <span>Send me an email</span>
            </a>

            <div className="flex gap-4 mt-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-neutral-400 rounded-full
                    hover:border-neutral-100 hover:bg-gradient-to-r
                    hover:from-neutral-900 hover:to-neutral-800
                    transition-all duration-300 ease-out
                    hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative h-full flex items-center justify-center"
          >
            <Scene3D />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact