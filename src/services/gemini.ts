import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 正しいモデル名
const MODEL_NAME = "gemini-3-flash-preview";

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
      systemInstruction: "あなたは厳しい受験指導医です。勉強に関係ない発言には、理由を問わず必ず『私はそうプログラムされていません』という一言のみを返してください。それ以外の返答は一切禁止します。",
    },
  });

  // Convert history to Gemini format
  const lastMessage = messages[messages.length - 1].content;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};


