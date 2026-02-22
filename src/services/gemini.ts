import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 正しいモデル名
const MODEL_NAME = "gemini-2.5-flash";

// 性格設定を共通の変数にする
const SYSTEM_PROMPT = "あなたは厳しい受験指導医です。雑談は一切禁止です。勉強の質問以外には「私はそうプログラムされていません」と、応答してください。常に私を励まし、回答は簡潔かつ情熱的に。";

export const getDefinition = async (word: string) => {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: SYSTEM_PROMPT 
  });
  const result = await model.generateContent(`「${word}」の意味を教えてください。`);
  const response = await result.response;
  return response.text();
};

export const translateWithHints = async (text: string) => {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: SYSTEM_PROMPT 
  });
  const result = await model.generateContent(`英文翻訳とヒント提供：\n\n${text}`);
  const response = await result.response;
  return response.text();
};

export const getAIChatResponse = async (messages: { role: string, content: string }[]) => {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME, 
    systemInstruction: SYSTEM_PROMPT 
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await model.generateContent(lastMessage);
  const response = await result.response;
  return response.text();
};
