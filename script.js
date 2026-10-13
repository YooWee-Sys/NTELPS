
const loginForm = document.getElementById("login-form");

// LOGIN FUNCTION
if (loginForm) {
    const studentName = document.getElementById("student-name");
    const studentId = document.getElementById("student-id");
    const message = document.getElementById("message");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = studentName.value.trim();
        const id = studentId.value.trim();

        // Validate student name
        const namePattern = /^[a-zA-Z ]+$/;

        if (!namePattern.test(name)) {
            message.textContent =
                "Name must contain letters and spaces only.";
            return;
        }

        // Validate student ID (letters and numbers allowed)
        const idPattern = /^[0-9a-zA-Z]+$/;

        if (!idPattern.test(id)) {
            message.textContent =
                "Student ID must contain numbers and letters only.";
            return;
        }

        // Save student name and continue
        sessionStorage.setItem("studentName", name);

        window.location.href = "dashboard.html";

        
    });
}
const welcomeMessage = document.getElementById("welcome-message");
const savedName = sessionStorage.getItem("studentName");

if (welcomeMessage && savedName) {
    welcomeMessage.textContent = "Welcome, " + savedName + "!";
}


// DASHBOARD BUTTONS
const reviewButton = document.getElementById("review-btn");
const mockButton = document.getElementById("mock-btn");
const logoutButton = document.getElementById("logout-btn");
const message = document.getElementById("message");

// Review Learning Materials
if (reviewButton) {
    reviewButton.addEventListener("click", function() {
        window.location.href = "review.html";
    });
}

// Take a Mock Test
if (mockButton) {
    mockButton.addEventListener("click", function() {
        window.location.href = "mock-test.html";
    });
}

// Log Out
if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        sessionStorage.setItem("logoutMessage", "LOGGED OUT SUCCESSFULLY");
        sessionStorage.removeItem("studentName");

        window.location.href = "index.html";
    });
} 
const logoutMessage = sessionStorage.getItem("logoutMessage");

if (logoutMessage && message) {
    message.textContent = logoutMessage;
    message.style.color = "green";

    sessionStorage.removeItem("logoutMessage");
}


const saveButton = document.getElementById("save-notes");
const savedNotesList = document.getElementById("saved-notes-list");

function getStudentName() {
    return sessionStorage.getItem("studentName") || "";
}

// SAVE NOTES TO FIRESTORE THROUGH THE BACKEND
if (saveButton) {
    saveButton.addEventListener("click", async function () {
        const titleInput = document.getElementById("note-title");
        const notesInput = document.getElementById("student-notes");
        const message = document.getElementById("notes-message");

        const title = titleInput.value.trim();
        const content = notesInput.value.trim();
        const studentName = getStudentName();

        if (!studentName) {
            message.textContent = "Please log in first.";
            message.style.color = "red";
            return;
        }

        if (!title || !content) {
            message.textContent = "Please enter both a title and notes.";
            message.style.color = "red";
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName,
                    title,
                    content
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Could not save notes.");
            }

            message.textContent = "Notes saved successfully!";
            message.style.color = "green";

            titleInput.value = "";
            notesInput.value = "";
        } catch (error) {
            message.textContent =
                error.message || "Could not connect to the server.";
            message.style.color = "red";
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Notes";
        }
    });
}

// LOAD SAVED NOTES FROM FIRESTORE THROUGH THE BACKEND
if (savedNotesList) {
    async function displaySavedNotes() {
        savedNotesList.textContent = "Loading notes...";

        try {
            const studentName = getStudentName();

            if (!studentName) {
                savedNotesList.textContent = "Please log in to view your notes.";
                return;
            }

            const response = await fetch(
                "/api/notes?studentName=" + encodeURIComponent(studentName)
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not load notes.");
            }

            savedNotesList.replaceChildren();

            if (!data.notes || data.notes.length === 0) {
                savedNotesList.textContent = "You have no saved notes yet.";
                return;
            }

            data.notes.forEach(function (note) {
                const card = document.createElement("div");
                card.className = "saved-note-card";

                const title = document.createElement("h2");
                title.textContent = note.title || "Untitled Note";

                const content = document.createElement("p");
                content.textContent = note.content || "";
                content.style.whiteSpace = "pre-wrap";

                const date = document.createElement("small");
                date.textContent = "Saved on: " +
                    (note.createdAt || "Recently");

                card.append(title, content, date);
                savedNotesList.appendChild(card);
            });
        } catch (error) {
            savedNotesList.textContent =
                error.message || "Could not load saved notes.";
        }
    }

    displaySavedNotes();
}
