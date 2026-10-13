

import express from "express";
import {
    initializeApp,
    applicationDefault,
    cert
} from "firebase-admin/app";
import {
    getFirestore,
    FieldValue
} from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (serviceAccountJson) {
    initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
        projectId: "ntelps"
    });
} else {
    initializeApp({
        credential: applicationDefault(),
        projectId: "ntelps"
    });
}

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




app.post("/api/notes", async (req, res) => {
    try {
        const { studentName, title, content } = req.body;

        if (
            typeof studentName !== "string" ||
            typeof title !== "string" ||
            typeof content !== "string" ||
            !studentName.trim() ||
            !title.trim() ||
            !content.trim() ||
            studentName.trim().length > 100 ||
            title.trim().length > 200 ||
            content.trim().length > 20000
        ) {
            return res.status(400).json({
                error: "Please provide a valid name, title, and note content."
            });
        }

        const docRef = await db.collection("student_notes").add({
            studentName: studentName.trim(),
            title: title.trim(),
            content: content.trim(),
            createdAt: FieldValue.serverTimestamp()
        });

        return res.status(201).json({
            success: true,
            id: docRef.id
        });
    } catch (error) {
        console.error("Saving notes failed:", error.message);

        return res.status(500).json({
            error: "Could not save notes. Please try again."
        });
    }
});


app.get("/api/notes", async (req, res) => {
    try {
        const studentName = req.query.studentName;

        if (
            typeof studentName !== "string" ||
            !studentName.trim() ||
            studentName.trim().length > 100
        ) {
            return res.status(400).json({
                error: "A valid student name is required."
            });
        }

        const snapshot = await db.collection("student_notes")
            .where("studentName", "==", studentName.trim())
            .get();

        const notes = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                title: data.title,
                content: data.content,
                createdAt: data.createdAt
                    ? data.createdAt.toDate().toLocaleString()
                    : "Recently"
            };
        });

        return res.json({ notes });
    } catch (error) {
        console.error("Loading notes failed:", error.message);

        return res.status(500).json({
            error: "Could not load saved notes."
        });
    }
});





// Start the web server.
app.listen(PORT, () => {
    console.log(`NTELPS server running at http://localhost:${PORT}`);
});
