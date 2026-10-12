
import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/tutor", async (req, res) => {
    try {
        const question = req.body.question;

        if (
            typeof question !== "string" ||
            !question.trim() ||
            question.length > 4000
        ) {
            return res.status(400).json({
                error: "Please enter a question up to 4000 characters."
            });
        }

        const response = await fetch(
            "http://localhost:11434/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3.2:3b",
                    stream: false,
                    messages: [
                        {
                            role: "system",
                           content: "You are the NTELPS AI Tutor, part of the Next-Generation Tech-Enhanced Learning Platform for Students. Help students understand concepts, explain ideas clearly, give examples, and encourage critical thinking rather than copying answers."
                        },
                        {
                            role: "user",
                            content: question.trim()
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Ollama request failed.");
        }

        res.json({
            answer: data.message?.content || "No answer received."
        });

    } catch (error) {
        console.error("AI error:", error.message);

        res.status(500).json({
            error: "The AI could not respond. Check that Ollama is running."
        });
    }
});

app.listen(PORT, () => {
    console.log(`STISS server running at http://localhost:${PORT}`);
});
