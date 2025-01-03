import React, { useRef, useEffect, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import * as drawingUtils from "@mediapipe/drawing_utils";
import {
  GestureRecognizer,
  FilesetResolver,
  GestureRecognizerResult,
} from "@mediapipe/tasks-vision";
import { motion } from "framer-motion";

type Mode = "video" | "live";
type DebugInfo = { message: string; timestamp: number };

const GESTURE_MAP: Record<string, string> = {
  Thumbs_Up: "Yes/Agree",
  Thumbs_Down: "No/Disagree",
  Victory: "Two/Peace",
  Pointing_Up: "One/Look up",
  Open_Palm: "Hello/Here",
  Closed_Fist: "Stop/Hold",
  ILoveYou: "I love you",

  // Numerical Gestures
  Index_Finger_Up: "1",
  Index_And_Middle_Up: "2",
  Index_Middle_Ring_Up: "3",
  Four_Fingers_Up: "4",
  Five_Fingers_Up: "5",

  // Specific ASL Gestures
  Pinch: "Small/Little",
  Spread_Fingers: "Big/Large",
  Index_Pinky_Up: "I love you (ASL)",
  Thumb_Index_L: "L",
  Thumb_Pinky_Up: "Call me/Phone",
  Middle_Finger_Up: "Middle/Center",
  Waving_Hand: "Hello/Goodbye",
  Pointing_Right: "Right/That way",
  Pointing_Left: "Left/That way",
  Palm_Down: "No/Down/Stop",
  Palm_Up: "Yes/Up/Question",
  Finger_Crossed: "Hope/Wish",
  OK_Sign: "OK/Perfect",
  Rock_On: "Fun/Party",
  Peace_Sign: "Peace/Two",

  // Advanced Gestures
  Gun_Sign: "Danger/Gun",
  Knife_Sign: "Danger/Knife",
  Crossed_Arms: "No/Block/Disagree",
  Raised_Hand: "Attention/Stop",
  Hands_Up: "Surrender/Don't shoot",
  Hand_On_Chest: "Respect/Promise",
  Finger_Gun: "Threat/Imitate gun",
  Shushing: "Quiet/Be silent",
  Throat_Slash: "Threat/Warning",
  Two_Hands_Up: "Surrender/Calm down",
  Hand_Covering_Mouth: "Surprise/Shocked",
  Clenched_Two_Fists: "Anger/Ready to fight",
  Fist_Bump: "Greeting/Friendly",
  Salute: "Respect/Attention",

  // Emergency/Special Gestures
  SOS_Signal: "Help/Emergency",
  Two_Fingers_Sideways: "V/Peace (sideways)",
  Circular_Hand_Motion: "Come here/Roll forward",
  Hand_Tapping_Wrist: "Time/Check watch",
  Hand_Cupping_Ear: "Can't hear/Repeat",
  Hand_Waving_Face: "Hot/Exhausted",
  Hand_Moving_Away: "Go away/Distance",
  Fist_Shaking: "Angry/Threat",
  Hands_Clasped: "Beg/Request",
  Thumb_Down: "No/Disagree", // Added to handle 'Thumb_Down' detected gesture
};

export default function Analyze() {
  // Core states
  const [analysisMode, setAnalysisMode] = useState<Mode>("video");
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecognizerReady, setIsRecognizerReady] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugInfo[]>([]);

  // Recognition states
  const [latestGesture, setLatestGesture] = useState("");
  const [partialGestures, setPartialGestures] = useState<string[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState("");

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);

  // Constants
  const DISPLAY_WIDTH = 640;
  const DISPLAY_HEIGHT = 360;

  // Debug logger
  const addDebugLog = (message: string) => {
    console.log(`[Analyze] ${message}`);
    setDebugLogs((prev) => [
      { message, timestamp: Date.now() },
      ...prev.slice(0, 9),
    ]);
  };

  // Initialize GestureRecognizer
  useEffect(() => {
    async function initRecognizer() {
      try {
        addDebugLog("Initializing GestureRecognizer...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/gesture_recognizer.task",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        gestureRecognizerRef.current = recognizer;
        setIsRecognizerReady(true);
        addDebugLog("GestureRecognizer initialized successfully");
      } catch (error) {
        addDebugLog(`Error initializing recognizer: ${error}`);
        setIsRecognizerReady(false);
      }
    }
    initRecognizer();
  }, []);

  // Handle mode switching
  useEffect(() => {
    handleStop();
    setLatestGesture("");
    setPartialGestures([]);
    setAiInterpretation("");
    addDebugLog(`Switched to ${analysisMode} mode`);
  }, [analysisMode]);

  // Start analysis
  const handleStart = () => {
    if (!isRecognizerReady) {
      addDebugLog("Cannot start: Recognizer not ready");
      return;
    }
    if (analysisMode === "video" && !videoSource) {
      addDebugLog("Cannot start: No video uploaded");
      return;
    }

    setIsAnalyzing(true);
    addDebugLog(`Starting analysis in ${analysisMode} mode`);

    if (analysisMode === "video" && videoRef.current && videoSource) {
      // Ensure video is ready to play
      videoRef.current.onloadedmetadata = () => {
        videoRef.current!.play();
        addDebugLog("Video loaded and playing");
        requestAnimationFrame(videoLoop);
      };

      // Handle video end
      videoRef.current.onended = () => {
        addDebugLog("Video finished");
        handleStop();
      };
    }

    if (analysisMode === "live" && videoRef.current) {
      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await processFrame(videoRef.current);
          }
        },
        width: DISPLAY_WIDTH,
        height: DISPLAY_HEIGHT,
      });
      cameraRef.current = cam;
      cam.start().catch((error) => {
        addDebugLog(`Camera error: ${error}`);
      });
    }
  };

  // Stop analysis
  const handleStop = () => {
    addDebugLog("Stopping analysis");
    setIsAnalyzing(false);

    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Stop video/camera
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video position
    }

    // Reset states
    setLatestGesture("");
    setPartialGestures([]);
    setAiInterpretation("");
  };

  // Process video frames
  const videoLoop = () => {
    if (!isAnalyzing || !videoRef.current) return;

    if (videoRef.current.paused) {
      addDebugLog("Video paused");
      return;
    }

    try {
      processFrame(videoRef.current);
      requestAnimationFrame(videoLoop);
    } catch (error) {
      addDebugLog(`Video processing error: ${error}`);
      handleStop();
    }
  };

  // Add a processing flag to prevent concurrent frame processing
  const isProcessingRef = useRef(false);

  // Process a single frame
  const processFrame = async (videoEl: HTMLVideoElement) => {
    if (isProcessingRef.current) return; // Skip if already processing
    isProcessingRef.current = true;

    if (!gestureRecognizerRef.current || !canvasRef.current) {
      isProcessingRef.current = false;
      return;
    }

    try {
      // Create a temporary canvas to capture the video frame
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = videoEl.videoWidth;
      tempCanvas.height = videoEl.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        isProcessingRef.current = false;
        return;
      }

      // Draw current video frame to temp canvas
      tempCtx.drawImage(videoEl, 0, 0, tempCanvas.width, tempCanvas.height);

      const results = gestureRecognizerRef.current.recognizeForVideo(
        tempCanvas,
        Date.now()
      );

      drawResults(videoEl, results);
      interpretResults(results);
    } catch (error) {
      addDebugLog(`Frame processing error: ${error}`);
    }

    isProcessingRef.current = false;
  };

  // Draw results on canvas
  const drawResults = (
    videoEl: HTMLVideoElement,
    results: GestureRecognizerResult
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        // Draw hand skeleton
        drawingUtils.drawConnectors(
          ctx,
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS as unknown as drawingUtils.LandmarkConnectionArray,
          {
            color: "#00FF00",
            lineWidth: 2,
          }
        );

        // Draw joints
        landmarks.forEach((landmark, index) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          // Different colors for different parts of the hand
          let color = "#FF0000"; // Default red for most points

          // Fingertips in blue
          if ([4, 8, 12, 16, 20].includes(index)) {
            color = "#0000FF";
          }
          // Base of fingers in yellow
          else if ([2, 6, 10, 14, 18].includes(index)) {
            color = "#FFFF00";
          }
          // Wrist in white
          else if (index === 0) {
            color = "#FFFFFF";
          }

          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        });

        // Add confidence score
        if (results.gestures?.[0]?.[0]) {
          const gesture = results.gestures[0][0];
          const confidence = (gesture.score * 100).toFixed(1);
          ctx.font = "16px Arial";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(`${gesture.categoryName} (${confidence}%)`, 10, 30);
        }
      }
    }
  };

  // Interpret results with confidence threshold
  const interpretResults = (results: GestureRecognizerResult) => {
    if (!results.gestures?.length) {
      setLatestGesture("");
      return;
    }

    const gesture = results.gestures[0][0];
    if (!gesture) return;

    const gestureName = gesture.categoryName;
    const confidence = gesture.score || 0;

    // Lower the confidence threshold to catch more gestures
    if (confidence >= 0.7) {
      setLatestGesture(gestureName);

      setPartialGestures((prev) => {
        if (prev.length > 0 && prev[prev.length - 1] === gestureName) {
          return prev;
        }

        const filtered = prev.filter((g) => g !== "None");
        const updatedGestures = [...filtered, gestureName].slice(-10); // Changed from 25 to 10

        // Trigger AI interpretation when 10 gestures are collected
        if (updatedGestures.length === 10) {
          handleAiInterpretation(updatedGestures); // Pass gestures directly
          return []; // Reset gestures after sending
        }

        return updatedGestures;
      });

      addDebugLog(
        `Detected: ${gestureName} (${confidence.toFixed(2)}) - ${
          GESTURE_MAP[gestureName] || "Unknown gesture"
        }`
      );
    }
  };

  // Handle AI Interpretation
  const handleAiInterpretation = async (gestures: string[]) => {
    const validGestures = gestures.filter((g) => g !== "None");
    if (validGestures.length === 0) return;

    try {
      const gestureSequence = validGestures
        .map((g) => GESTURE_MAP[g] || g)
        .join(" ");

      const promptText = `
        You are an assistant. Interpret this hand gesture sequence concisely:
        ${gestureSequence}

        Original gestures: ${validGestures.join(" → ")}
      `;

      addDebugLog("Requesting AI interpretation...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
          }),
        }
      );

      // Log the entire response
      addDebugLog(`AI API response status: ${response.status}`);
      const responseBody = await response.text();
      addDebugLog(`AI API response body: ${responseBody}`);

      // Attempt to parse JSON
      let data;
      try {
        data = JSON.parse(responseBody);
        addDebugLog(`Parsed AI response data: ${JSON.stringify(data)}`);
      } catch (parseError) {
        addDebugLog(`Error parsing AI response: ${parseError}`);
        return;
      }

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const interpretation = data.candidates[0].content.parts[0].text.trim();
        setAiInterpretation(interpretation);
        addDebugLog(`Interpreted as: ${interpretation}`);
      } else {
        addDebugLog("No interpretation received from AI.");
      }
    } catch (error) {
      // Log the error stack for deeper debugging
      addDebugLog(
        `AI interpretation error: ${
          error instanceof Error ? error.message : error
        }`
      );
      if (error instanceof Error && error.stack) {
        addDebugLog(`Error stack: ${error.stack}`);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setVideoSource(fileURL);
    addDebugLog(`Video uploaded: ${file.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <motion.div
        className="p-6 flex justify-center items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-4 bg-gray-800 p-2 rounded-lg">
          <button
            onClick={() => setAnalysisMode("video")}
            className={`px-6 py-2 rounded-md transition-all ${
              analysisMode === "video"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setAnalysisMode("live")}
            className={`px-6 py-2 rounded-md transition-all ${
              analysisMode === "live"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Live
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Left Column - Video/Canvas */}
        <motion.div
          className="lg:w-2/3 flex flex-col items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-xl">
            {/* Video Element */}
            {analysisMode === "live" && (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            )}

            {analysisMode === "video" && videoSource && !isAnalyzing && (
              <video
                ref={videoRef}
                src={videoSource}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
              />
            )}

            {/* Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={DISPLAY_WIDTH}
              height={DISPLAY_HEIGHT}
              className={`absolute inset-0 w-full h-full ${
                !isAnalyzing ? "opacity-50" : "opacity-100"
              } transition-opacity`}
            />

            {/* Upload Overlay */}
            {analysisMode === "video" && !videoSource && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <label
                  htmlFor="video-upload"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors"
                >
                  Upload Video
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleStart}
              disabled={
                isAnalyzing ||
                (!videoSource && analysisMode === "video") ||
                !isRecognizerReady
              }
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isAnalyzing ||
                !isRecognizerReady ||
                (!videoSource && analysisMode === "video")
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Start
            </button>
            {analysisMode === "video" && isAnalyzing && (
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      addDebugLog("Video resumed");
                    } else {
                      videoRef.current.pause();
                      addDebugLog("Video paused");
                    }
                  }
                }}
                className="px-6 py-2 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700"
              >
                {videoRef.current?.paused ? "Resume" : "Pause"}
              </button>
            )}
            <button
              onClick={handleStop}
              disabled={!isAnalyzing}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                !isAnalyzing
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Stop
            </button>
          </div>
        </motion.div>

        {/* Right Column - Info */}
        <motion.div
          className="lg:w-1/3 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Latest Gesture */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Latest Gesture
            </h2>
            <p className="text-lg text-blue-400">
              {latestGesture
                ? `${latestGesture} ${
                    GESTURE_MAP[latestGesture]
                      ? `=> ${GESTURE_MAP[latestGesture]}`
                      : ""
                  }`
                : isAnalyzing
                ? "Analyzing..."
                : "None"}
            </p>
          </div>

          {/* AI Interpretation */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-white">
              AI Interpretation
            </h2>
            <p className="text-sm text-gray-400 mb-2">
              Partial gestures: {partialGestures.join(", ") || "None yet"}
            </p>
            <p className="text-lg text-green-400">
              {aiInterpretation ||
                (isAnalyzing
                  ? "Waiting for enough gestures..."
                  : "No interpretation yet")}
            </p>
          </div>

          {/* Debug Logs */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-white">
              Debug Logs
            </h2>
            <div className="space-y-2 text-sm font-mono h-40 overflow-y-auto">
              {debugLogs.map((log, i) => (
                <div key={i} className="text-gray-400">
                  [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
