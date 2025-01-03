export interface TranslationResult {
  originalText: string;
  translatedText: string;
  animationData: string; // This could be a URL or base64 encoded animation data
}

export interface APIResponse {
  success: boolean;
  data: TranslationResult;
  error?: string;
}
