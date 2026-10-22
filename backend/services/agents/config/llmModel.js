import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import {ChatOpenRouter} from "@langchain/openrouter"

const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
});

const gemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
});

const openrouter=new ChatOpenRouter({
  model:"deepseek/deepseek-chat",
  temperature:0,
  maxTokens:2500
})

const qwen = new ChatOpenAI({
  apiKey: "dummy",
  model: "qwen2.5:7b",
  configuration: {
    baseURL: "http://localhost:11434/v1",
  },
});

const deepseek = new ChatOpenAI({
  apiKey: "dummy",
  model: "deepseek-coder:6.7b",
  configuration: {
    baseURL: "http://localhost:11434/v1",
  },
});

const llama = new ChatOpenAI({
  apiKey: "dummy",
  model: "llama3.1:8b",
  configuration: {
    baseURL: "http://localhost:11434/v1",
  },
});

export const getModel = (messageType) => {
  switch (messageType) {
    case "chat":
      return groq;
    case "coding":
      return openrouter;
    case "search":
      return groq;
    case "ppt":
      return groq;
    case "imageanalyser":
      return gemini;
    default:
      return groq;
  }
};
