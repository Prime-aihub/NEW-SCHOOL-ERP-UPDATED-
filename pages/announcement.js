// ======================================
// PRIMEAIHUB SCHOOL ERP
// announcement.js
// ======================================

import { db } from "../js/firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ---------------------------
// HTML Elements
// ---------------------------

const form = document.getElementById("announcementForm");
const message = document.getElementById("message");
const announcementList = document.getElementById("announcementList");

let editId = null;

// ---------------------------
// Save / Update Announcement
// ---------------------------

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const priority = document.getElementById("priority").value;
    const status = document.getElementById("status").value;
    const createdBy = document.getElementById("createdBy").value;
    const audience = document.getElementById("audience").value;
const className = document.getElementById("className").value;
const section = document.getElementById("section").value;

const file = document.getElementById("attachment").files[0];

const attachmentName = file ? file.name : "";
const attachmentType = file ? file.type : "";

    if (!title || !description) {
        showMessage("Please fill all required fields.", "red");
        return;
    }

    try {

        if (editId) {

            await updateDoc(doc(db, "announcements", editId), {

                title,
                description,
                category,
                priority,
                status,
                createdBy,
                updatedAt: serverTimestamp()

            });

            showMessage("Announcement updated successfully.");

            editId = null;

        } else {

           await addDoc(collection(db, "announcements"), {

    title,
    description,
    category,

    audience,
    className,
    section,

    priority,
    status,
    createdBy,

    attachmentName,
    attachmentType,

    publishDate: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()

});

            showMessage("Announcement saved successfully.");

        }

        form.reset();

        document.getElementById("createdBy").value = "Admin";

        loadAnnouncements();

    }

    catch (error) {

        console.error(error);

        showMessage("Something went wrong.", "red");

    }

});

// ---------------------------
// Load Announcements
// ---------------------------

async function loadAnnouncements() {

    announcementList.innerHTML = "";

    const q = query(
        collection(db, "announcements"),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const card = document.createElement("div");

        card.className = "announcement-card";

       card.innerHTML = `

    <h3>${data.title}</h3>

    <div class="announcement-meta">

        <span><b>Category:</b> ${data.category}</span>

        <span><b>Priority:</b> ${data.priority}</span>

        <span><b>Status:</b> ${data.status}</span>

    </div>

    <p>${data.description}</p>

    <div class="announcement-meta">

        <span><b>Audience:</b> ${data.audience || "All"}</span>

        <span><b>Class:</b> ${data.className || "All Classes"}</span>

        <span><b>Section:</b> ${data.section || "All Sections"}</span>

    </div>

    ${
        data.attachmentName
            ? `<p><b>📎 Attachment:</b> ${data.attachmentName}</p>`
            : ""
    }

    <div class="card-buttons">

        <button
            class="edit-btn"
            data-id="${docSnap.id}">
            Edit
        </button>

        <button
            class="delete-btn"
            data-id="${docSnap.id}">
            Delete
        </button>

    </div>

`;

        announcementList.appendChild(card);

    });

    attachButtons();

}

// ---------------------------
// Edit & Delete Buttons
// ---------------------------

function attachButtons() {

    document.querySelectorAll(".edit-btn").forEach(btn => {

        btn.onclick = async () => {

            const id = btn.dataset.id;

            const snap = await getDocs(collection(db, "announcements"));

            snap.forEach((d) => {

                if (d.id === id) {

                    const a = d.data();

                    document.getElementById("title").value = a.title;
                    document.getElementById("description").value = a.description;
                    document.getElementById("category").value = a.category;
                    document.getElementById("priority").value = a.priority;
                    document.getElementById("status").value = a.status;
                    document.getElementById("createdBy").value = a.createdBy;

                    editId = id;

                    window.scrollTo({

                        top: 0,
                        behavior: "smooth"

                    });

                }

            });

        };

    });

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.onclick = async () => {

            if (!confirm("Delete this announcement?")) return;

            await deleteDoc(doc(db, "announcements", btn.dataset.id));

            showMessage("Announcement deleted.");

            loadAnnouncements();

        };

    });

}

// ---------------------------
// Message
// ---------------------------

function showMessage(text, color = "green") {

    message.style.color = color;

    message.textContent = text;

    setTimeout(() => {

        message.textContent = "";

    }, 3000);

}

// ---------------------------
// Initial Load
// ---------------------------

loadAnnouncements();