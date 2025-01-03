import axios from "axios";
import { TranslationResult, APIResponse } from "../types";

const API_BASE_URL = "http://localhost:5000/api"; // Replace with your actual API URL

export const translateText = async (
  text: string
): Promise<TranslationResult> => {
  try {
    const response = await axios.post<APIResponse>(
      `${API_BASE_URL}/translate`,
      { text }
    );
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || "Failed to translate text");
    }
  } catch (error) {
    console.error("API error:", error);
    throw new Error("Failed to translate text");
  }
};
