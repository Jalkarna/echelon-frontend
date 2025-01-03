import React, { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import ThreeDModel from "./components/ThreeDModel";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Textarea from "./components/ui/textarea";
import Analyze from "./pages/Analyze";

const App: React.FC = () => {
  // State management
  const [inputText, setInputText] = useState<string>("");
  const [translation, setTranslation] = useState<string | null>(null);
  const [movements, setMovements] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userHasTranslated, setUserHasTranslated] = useState<boolean>(false);

  // Function to fetch data from the backend
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate.");
      return;
    }

    setIsLoading(true);
    setUserHasTranslated(true);

    try {
      const response = await fetch("http://localhost:8000/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch translation data.");
      }

      const data = await response.json();
      console.log("Full API Response:", data);

      // Store the translation text
      setTranslation(data.sign_grammar_text);

      // Ensure frames_json is properly formatted before setting it
      if (data.frames_json) {
        try {
          // If it's a string, try parsing it to validate
          const parsedFrames =
            typeof data.frames_json === "string"
              ? JSON.parse(data.frames_json)
              : data.frames_json;

          console.log("Parsed frames:", parsedFrames);

          // Store the validated frames data
          setMovements({
            frames_json: parsedFrames,
            facial_expression: data.facial_expression,
            hand_movement: data.hand_movement,
          });
        } catch (e) {
          console.error("Error parsing frames_json:", e);
          toast.error("Error processing animation data");
        }
      } else {
        console.warn("No frames_json data received from API");
      }

      toast.success("Translation successful!");
    } catch (error) {
      console.error("Translation error:", error);
      setTranslation(null);
      setMovements(null);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="relative container mx-auto px-4 py-12">
          {/* Navigation Bar */}
          <nav className="flex justify-between items-center mb-8">
            <div className="text-2xl font-bold">Signify</div>
            <ul className="flex space-x-4">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `hover:text-blue-400 ${isActive ? "text-blue-400" : ""}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/features"
                  className={({ isActive }) =>
                    `hover:text-blue-400 ${isActive ? "text-blue-400" : ""}`
                  }
                >
                  Features
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `hover:text-blue-400 ${isActive ? "text-blue-400" : ""}`
                  }
                >
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/analyze"
                  className={({ isActive }) =>
                    `hover:text-blue-400 ${isActive ? "text-blue-400" : ""}`
                  }
                >
                  Analyze
                </NavLink>
              </li>
            </ul>
          </nav>

          <Routes>
            {/* Home Route */}
            <Route
              path="/"
              element={
                <>
                  <header className="text-center mb-12">
                    <motion.h1
                      className="text-5xl font-bold mb-4"
                      initial={{ y: -30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      Signify
                    </motion.h1>
                    <motion.p
                      className="text-xl text-gray-300 max-w-2xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                        delay: 0.3,
                      }}
                    >
                      Bridging communication gaps with cutting-edge AI
                      technology and real-time sign language translation.
                    </motion.p>
                  </header>

                  <div className="flex flex-col md:flex-row md:space-x-8">
                    {/* Input and Translation Section */}
                    <div className="w-full md:w-1/2 space-y-6">
                      <Card>
                        <CardContent>
                          <div className="space-y-6">
                            <Textarea
                              placeholder="Enter text to translate into sign language..."
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              className="min-h-[120px] text-lg p-4"
                            />
                            <div className="flex justify-center">
                              <motion.button
                                onClick={handleTranslate}
                                disabled={isLoading}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg 
                                        font-medium text-white shadow-lg transition-all duration-200
                                        disabled:opacity-50 text-lg w-auto min-w-[200px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {isLoading ? (
                                  <span className="flex items-center justify-center space-x-2">
                                    <svg
                                      className="animate-spin h-5 w-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    <span>Translating...</span>
                                  </span>
                                ) : (
                                  "Translate"
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Translation Result */}
                      <AnimatePresence>
                        {!isLoading && translation ? (
                          <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          >
                            <h2 className="text-2xl font-semibold text-white">
                              Translation Result:
                            </h2>
                            <div className="bg-gray-800 rounded-lg p-6">
                              <p className="text-lg text-gray-300">
                                {translation}
                              </p>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>

                      {/* No Translation Found */}
                      {!isLoading && !translation && userHasTranslated && (
                        <p className="text-sm text-red-400 mt-4">
                          No translation found for this text.
                        </p>
                      )}
                    </div>

                    {/* 3D Model Section */}
                    <div className="w-full md:w-1/2 mt-8 md:mt-0">
                      <div className="h-full flex items-center justify-center">
                        <div className="w-full h-[500px] bg-gray-800 rounded-lg overflow-hidden">
                          <ThreeDModel
                            movements={movements} // Ensure movements structure matches ThreeDModelProps
                            facial_expression={movements?.facial_expression}
                            hand_movement={movements?.hand_movement}
                          />
                          {movements?.frames_json &&
                            movements.frames_json.length === 0 && (
                              <p className="text-sm text-yellow-400 p-4">
                                No recognized sign frames generated.
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              }
            />

            {/* Other Routes */}
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/analyze" element={<Analyze />} />
          </Routes>

          {/* Footer */}
          <footer className="mt-16 text-center text-gray-400">
            <p className="mb-2">© 2024 Signify. All rights reserved.</p>
            <p>Powered by cutting-edge AI and 3D rendering technology</p>
          </footer>
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          theme="dark"
          toastClassName="bg-gray-900 text-white"
        />
      </div>
    </Router>
  );
};

export default App;
