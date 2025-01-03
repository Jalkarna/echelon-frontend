import { useState } from "react";
import { toast } from "react-toastify";

export const useTranslation = () => {
  const [inputText, setInputText] = useState<string>("");
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate.");
      return;
    }

    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTranslation(inputText.toUpperCase());
      toast.success("Translation completed successfully!");
    } catch (error) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    inputText,
    setInputText,
    translation,
    isLoading,
    handleTranslate,
  };
};
