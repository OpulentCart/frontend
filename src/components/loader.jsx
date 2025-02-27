import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  // Animation variants for the container (smooth entry)
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for the spinning circle
  const circleVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Animation variants for the pulsating dots
  const dotVariants = {
    animate: {
      scale: [1, 1.3, 1], // Slightly larger pulse for elegance
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Animation variants for the text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden" // Smooth exit when loader disappears
    >
      <div className="flex flex-col items-center gap-6">
        {/* Spinning Circle */}
        <motion.div
          className="w-16 h-16 border-4 border-t-yellow-500 border-gray-300 rounded-full"
          variants={circleVariants}
          animate="animate"
        />

        {/* Pulsating Dots */}
        <div className="flex justify-center gap-3">
          <motion.div
            className="w-3 h-3 bg-yellow-500 rounded-full"
            variants={dotVariants}
            animate="animate"
            initial={{ scale: 1 }}
            transition={{ delay: 0 }}
          />
          <motion.div
            className="w-3 h-3 bg-yellow-500 rounded-full"
            variants={dotVariants}
            animate="animate"
            initial={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
          <motion.div
            className="w-3 h-3 bg-yellow-500 rounded-full"
            variants={dotVariants}
            animate="animate"
            initial={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          className="text-white text-xl font-semibold"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Loader;