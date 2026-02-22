import { GoogleGenerativeAI } from "@google/generative-ai";

// 新しいAPIキーを直接セット
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// モデル名：Gemini 3 Flash Preview
const MODEL_NAME = "gemini-3-flash-preview";

export const getDefinition = async (word: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`「${word}」の意味を、受験生に分かりやすく簡潔に教えてください。`);
  const response = await result.response;
  return response.text();
};

export const translateWithHints = async (text: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`以下の英文を翻訳し、受験に役立つ文法や単語のヒントを添えてください。\n\n${text}`);
  const response = await result.response;
  return response.text();
};

export const getAIChatResponse = async (messages: { role: string, content: string }[]) => {
  // システム指示（厳しい受験指導医の設定）をここに入れます
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: "あなたは厳しい受験指導医です。雑談はせず勉強の質問のみ答え、私を励ましてください。回答は簡潔かつ情熱的に。",
  });

  // 最新のメッセージを取得して送信
  const lastMessage = messages[messages.length - 1].content;
  const result = await model.generateContent(lastMessage);
  const response = await result.response;
  return response.text();
};