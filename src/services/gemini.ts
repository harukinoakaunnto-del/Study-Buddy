import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 正しいモデル名
const MODEL_NAME = "gemini-2.5-flash";

export const getDefinition = async (word: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `「${word}」の意味を、受験生に分かりやすく簡潔に教えてください。`,
  });
  return response.text;
};

export const translateWithHints = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `以下の英文を翻訳し、受験に役立つ文法や単語のヒントを添えてください。\n\n${text}`,
  });
  return response.text;
};

export const getAIChatResponse = async (messages: { role: string, content: string }[]) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "あなたは厳しい受験指導医です。雑談はせず勉強の質問のみ答え、私を励ましてください。回答は簡潔かつ情熱的に。",
    },
  });

  // Convert history to Gemini format
  const lastMessage = messages[messages.length - 1].content;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};


