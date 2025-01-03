import React, { useState, ChangeEvent } from "react";
import Input from "../components/ui/input";
import Textarea from "../components/ui/textarea";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Simulate form submission
    toast.success("Message sent successfully!");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="text-center py-12">
      <h2 className="text-4xl font-bold mb-6">Contact Us</h2>
      <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
        Have questions or feedback? We'd love to hear from you.
      </p>
      <motion.form
        className="max-w-md mx-auto space-y-4 bg-gray-800 p-8 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          required
          className="bg-gray-900 text-white placeholder-gray-400 border-gray-600"
        />
        <Input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
          className="bg-gray-900 text-white placeholder-gray-400 border-gray-600"
        />
        <Textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-32 bg-gray-900 text-white placeholder-gray-400 border-gray-600"
          required
        />
        <motion.button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Send Message
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Contact;
