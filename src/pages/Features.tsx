import React from "react";
import { motion } from "framer-motion";

const Features: React.FC = () => {
  const featureList = [
    {
      title: "Live Interpretation",
      description:
        "Real-time conversion of spoken language into sign language animations.",
      icon: "👁️",
    },
    {
      title: "Customizable Avatars",
      description:
        "Choose from a variety of avatars to personalize your experience.",
      icon: "🧑‍🤝‍🧑",
    },
    {
      title: "Multilingual Support",
      description:
        "Supports translation between multiple languages and sign languages.",
      icon: "🌐",
    },
    {
      title: "User-friendly Interface",
      description: "Intuitive design for seamless interaction and translation.",
      icon: "✨",
    },
    {
      title: "Secure Data Handling",
      description:
        "Ensuring your data is protected with top-notch security measures.",
      icon: "🔒",
    },
    {
      title: "Continuous Learning",
      description:
        "AI models that learn and improve over time for accurate translations.",
      icon: "📈",
    },
  ];

  return (
    <div className="py-12 bg-gray-900">
      <h2 className="text-4xl font-bold text-center text-white mb-8">
        Our Features
      </h2>
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
