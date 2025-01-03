import { useState } from "react";
import { toast } from "react-toastify";

export const useSignLanguageTranslation = () => {
  const [inputText, setInputText] = useState<string>("");
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [movements, setMovements] = useState<any>(null);
  const [userHasTranslated, setUserHasTranslated] = useState<boolean>(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate.");
      return;
    }

    setUserHasTranslated(true);
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Translation request failed (status: ${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      setTranslation(data.sign_grammar_text);
      setMovements(data.movements);

      toast.success("Translation completed successfully!");
    } catch (error: any) {
      toast.error(`Translation failed: ${error.message}`);
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
    movements,
    userHasTranslated,
  };
};
