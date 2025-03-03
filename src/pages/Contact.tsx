import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';
import Background from '../components/Background';
import DecryptedText from '../components/DecryptedText';

const Contact = () => {
  const socialLinks = [
    { 
      icon: Mail, 
      label: 'Mail', 
      href: 'mailto:basit.faisal.work@gmail.com' 
    },
    { 
      icon: Github, 
      label: 'GitHub', 
      href: 'https://github.com/basit-faisal' 
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      href: 'https://www.linkedin.com/in/basitfaisal/' 
    },
    {
      icon: ExternalLink,
      label: 'Upwork',
      href: 'https://www.upwork.com/freelancers/basitfaisal'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden pt-40 md:pt-48"
    >
      <Background />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:mx-auto md:w-2/3"
          >
            <div className="rounded-lg bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 p-8 md:p-12 shadow-lg">
              <div className="space-y-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold">
                  <DecryptedText
                    text="Contact Me"
                    speed={150}
                    maxIterations={30}
                    sequential={true}
                    revealDirection="center"
                    animateOn="view"
                    className="text-neutral-100"
                    encryptedClassName="text-neutral-500"
                    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+"
                  />
                </h1>
                <p className="text-neutral-400 text-lg">
                  Feel free to reach out for collaborations, opportunities, or just to say hello!
                </p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 pt-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-neutral-100 hover:text-neutral-400 transition-colors"
                    >
                      <link.icon size={20} />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;