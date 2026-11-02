import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const models = {
  "gemini-2.5-flash": "gemini-2.5-flash",
  "gemma-4-26b-a4b-it": "gemma-4-26b-a4b-it",
  "google/gemma-4-31B": "gemma-4-31B"
}

const MODEL_NAME = models["gemini-2.5-flash"]

// With histroy
export async function googleGenAiMain({ prompt, history }) {

  let currHistroy = []

  // histroy is empty for first message
  if (history.length !== 0) {
    currHistroy = history.map((ele) => ({ role: ele.role, parts: [{ text: ele.content }] }));
  }

  const chat = ai.chats.create({
    model: MODEL_NAME,
    history: currHistroy,
  });

  const response = await chat.sendMessage({
    message: prompt,
  });

  return response;
}

export async function streamingChat({ prompt }) {
  const response = await ai.models.generateContentStream({
    model: MODEL_NAME,
    contents: prompt,
  });
  return response;
}

export async function genarateTitleOfTheThread({ contents }) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Summarize this conversation into a 3-word title: ${contents}`
  })

  return response;
}