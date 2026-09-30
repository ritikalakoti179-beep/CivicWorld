const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");

const app = express();
const PORT = 3000;

// Gemini client
const ai = new GoogleGenAI({});

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Gemini chatbot endpoint
app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage || !userMessage.trim()) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        const prompt = `
You are Civic AI, the helpful AI assistant inside CivicWorld.

CivicWorld is a civic platform where people can explore local
public facilities, understand their locality, and submit feedback.

Your job:
- Answer clearly and simply.
- Help users find and understand public facilities.
- Help with civic questions and locality-related information.
- Never invent facility information, timings, services, or availability.
- If information is not available, clearly say that it is not available.
- Do not make government decisions.
- Keep answers concise and useful.

User question:
${userMessage}
`;

        const interaction = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: prompt
        });

        res.json({
            reply: interaction.output_text
        });

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            error: "Civic AI is temporarily unavailable."
        });
    }
});

app.listen(PORT, () => {
    console.log(`CivicWorld running at http://localhost:${PORT}`);
});