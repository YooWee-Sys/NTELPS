
import express from "express";
import {
    initializeApp,
    applicationDefault
} from "firebase-admin/app";
import {
    getFirestore,
    FieldValue
} from "firebase-admin/firestore";

initializeApp({
    credential: applicationDefault(),
    projectId: "ntelps"
});

const db = getFirestore();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

// Student login: name + school ID.
app.post("/api/login", async (req, res) => {
    try {
        const { studentName, schoolId } = req.body;

        if (
            typeof studentName !== "string" ||
            typeof schoolId !== "string" ||
            !studentName.trim() ||
            !schoolId.trim() ||
            studentName.trim().length > 100 ||
            schoolId.trim().length > 50
        ) {
            return res.status(400).json({
                error: "Please enter a valid name and school ID."
            });
        }

        const cleanName = studentName.trim();
        const cleanSchoolId = schoolId.trim();

        const docRef = await db.collection("login_history").add({
            studentName: cleanName,
            schoolId: cleanSchoolId,
            event: "login",
            timestamp: FieldValue.serverTimestamp()
        });

        console.log("LOGIN HISTORY: Saved successfully:", docRef.id);

        return res.json({ success: true });

    } catch (error) {
        console.error("LOGIN FAILED:", error.message);

        return res.status(500).json({
            error: "Login could not be recorded. Please try again."
        });
    }
});

// AI Tutor endpoint.
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
                            content: "You are the NTELPS AI Tutor. Help students understand concepts, explain ideas clearly, give examples, and encourage critical thinking rather than copying answers."
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

        return res.json({
            answer: data.message?.content || "No answer received."
        });

    } catch (error) {
        console.error("AI error:", error.message);

        return res.status(500).json({
            error: "The AI could not respond. Check that Ollama is running."
        });
    }
});

// Start the web server.
app.listen(PORT, () => {
    console.log(`NTELPS server running at http://localhost:${PORT}`);
});
