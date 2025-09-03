import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// In-memory conversation history
let chatHistory = [];

// Max number of messages to keep
const MAX_HISTORY = 10;

// Chat API endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Add user message to history
    chatHistory.push({ role: "user", content: userMessage });

    // Keep only last MAX_HISTORY messages
    const recentHistory = chatHistory.slice(-MAX_HISTORY);

    // Format the conversation for Gemini
    const prompt = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    const result = await model.generateContent(prompt);
    const botReply = result.response.text();

    // Add bot reply to history
    chatHistory.push({ role: "bot", content: botReply });

    res.json({ reply: botReply });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
