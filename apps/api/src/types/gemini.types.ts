// Type definitions for Gemini API

export interface GeminiChatRequest {
  message: string;
}

export interface GeminiChatResponse {
  success: true;
  data: {
    message: string;
    apiKeyUsed: number;
  };
}

export interface GeminiErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export interface GeminiStatusResponse {
  success: true;
  data: {
    totalApiKeys: number;
    currentApiKeyNumber: number;
    message: string;
  };
}

export interface GeminiResetResponse {
  success: true;
  message: string;
}

export type GeminiApiResponse =
  | GeminiChatResponse
  | GeminiErrorResponse
  | GeminiResetResponse
  | GeminiStatusResponse;
