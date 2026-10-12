
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

if (saveButton) {
    saveButton.addEventListener("click", function() {
        const titleInput = document.getElementById("note-title");
        const notesInput = document.getElementById("student-notes");
        const message = document.getElementById("notes-message");

        const title = titleInput.value.trim();
        const notes = notesInput.value.trim();

        if (!title || !notes) {
            message.textContent =
                "Please fill out the note title and notes before saving.";
            message.style.color = "red";
            return;
        }

        const allNotes = JSON.parse(
            localStorage.getItem("studentNotes") || "[]"
        );

        allNotes.push({
            title: title,
            content: notes,
            date: new Date().toLocaleDateString()
        });

        localStorage.setItem(
            "studentNotes",
            JSON.stringify(allNotes)
        );

        message.textContent = "Your notes have been saved!";
        message.style.color = "green";

        titleInput.value = "";
        notesInput.value = "";
    });
}




const savedNotesList = document.getElementById("saved-notes-list");

if (savedNotesList) {
    const notesMessage = document.getElementById("notes-message");

    function displaySavedNotes() {
        savedNotesList.innerHTML = "";

        const allNotes = JSON.parse(
            localStorage.getItem("studentNotes") || "[]"
        );

        if (allNotes.length === 0) {
            if (notesMessage) {
                notesMessage.textContent = "You have no saved notes yet.";
                notesMessage.style.color = "gray";
            }
            return;
        }

        if (notesMessage) {
            notesMessage.textContent = "";
        }

        allNotes.forEach(function(note, index) {
            const noteCard = document.createElement("div");
            noteCard.className = "saved-note-card";

            const noteTitle = document.createElement("h2");
            noteTitle.textContent = note.title || "Untitled Note";

            const noteContent = document.createElement("p");
            noteContent.textContent = note.content || "";
            noteContent.style.whiteSpace = "pre-wrap";

            const noteDate = document.createElement("small");
            noteDate.textContent = "Saved on: " + (note.date || "Unknown date");

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete Note";
            deleteButton.className = "delete-note-btn";

            deleteButton.addEventListener("click", function() {
                const confirmed = confirm(
                    'Are you sure you want to delete "' +
                    (note.title || "Untitled Note") + '"?'
                );

                if (!confirmed) return;

                const updatedNotes = JSON.parse(
                    localStorage.getItem("studentNotes") || "[]"
                );

                updatedNotes.splice(index, 1);

                localStorage.setItem(
                    "studentNotes",
                    JSON.stringify(updatedNotes)
                );

                displaySavedNotes();
            });

            noteCard.appendChild(noteTitle);
            noteCard.appendChild(noteContent);
            noteCard.appendChild(noteDate);
            noteCard.appendChild(deleteButton);

            savedNotesList.appendChild(noteCard);
        });
    }

    displaySavedNotes();
}
