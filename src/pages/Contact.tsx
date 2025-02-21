import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import Background from '../components/Background';

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
      className="min-h-screen pt-24 px-6 relative overflow-hidden"
    >
      <Background />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h1
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-8"
        >
          Let's Connect
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
              I'm always open to new opportunities and interesting projects.
              Whether you have a question or just want to say hi, I'll try my
              best to get back to you!
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
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Follow Me</h2>
            <div className="space-y-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 text-neutral-400 hover:text-neutral-100 transition-colors"
                >
                  <link.icon size={24} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact