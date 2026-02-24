import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 正しいモデル名
const MODEL_NAME = "gemini-3-flash-preview";

export const getDefinition = async (word: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`「${word}」の意味を、受験生に分かりやすく簡潔に教えてください。`);
  return result.response.text();
};

export const translateWithHints = async (text: string) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(`以下の英文を翻訳し、受験に役立つ文法や単語のヒントを添えてください。\n\n${text}`);
  return result.response.text();
};

export const getAIChatResponse = async (messages: { role: string, content: string }[]) => {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: "あなたは厳しい受験指導医です。勉強に関係ない発言には、理由を問わず必ず『私はそうプログラムされていません』という一言のみを返してください。それ以外の返答は一切禁止します。",
  });

  // 過去の会話履歴をGeminiが理解できる形に整える
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return result.response.text();
};
