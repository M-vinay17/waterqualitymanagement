
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const profileVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 180,
      duration: 0.5,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1 + 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function Profile({ onClose }) {
  const user = {
    name: "Admin User",
    email: "admin@watermonitor.com",
    role: "Admin",
  };

  return (
    <AnimatePresence>
      {/* You can wrap in AnimatePresence in parent instead if preferred */}
      <motion.div
        key="profile-panel"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={profileVariants}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-hidden"
      >
        <div className="relative h-full p-6 sm:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <motion.h2
              className="text-2xl font-bold text-sky-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              User Profile
            </motion.h2>

            <motion.button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 text-2xl font-semibold transition-colors"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close"
            >
              ✕
            </motion.button>
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-700">
            {[
              { label: "Name", value: user.name },
              { label: "Email", value: user.email },
              { label: "Role", value: user.role },
            ].map((item, index) => (
              <motion.p
                key={item.label}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                <strong className="text-gray-900 min-w-[80px]">{item.label}:</strong>
                <span>{item.value}</span>
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}