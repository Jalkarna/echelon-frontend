import React, { InputHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface InputProps extends HTMLMotionProps<"input"> {
  className?: string;
}

const Input: React.FC<InputProps> = ({
  className = "",
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input changed:", e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <motion.input
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
      onChange={handleChange}
      whileFocus={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    />
  );
};

export default Input;
