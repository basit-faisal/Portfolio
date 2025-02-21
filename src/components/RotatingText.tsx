import React, { useEffect, useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const words = [
  "Data Engineer",
  "Quant Enthusiast",
  "Data Analyst",
  "Data Scientist"
];

const RotatingText = forwardRef((props, ref) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getColorScheme = (index: number) => {
    switch (index) {
      case 0: // Data Engineer
        return "text-green-500 bg-green-500/10";
      case 1: // Quant Enthusiast
        return "text-red-500 bg-red-500/10";
      case 2: // Data Analyst
        return "text-blue-500 bg-blue-500/10";
      case 3: // Data Scientist
        return "text-purple-500 bg-purple-500/10";
      default:
        return "text-neutral-200 bg-neutral-800/50";
    }
  };

  return (
    <div className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`${getColorScheme(index)} px-3 py-1 rounded-lg`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});

RotatingText.displayName = "RotatingText";
export default RotatingText; 