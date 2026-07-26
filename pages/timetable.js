import { auth, db } from "../js/firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const timetableImage =
document.getElementById("timetableImage");

const status =
document.getElementById("status");

const classTitle =
document.getElementById("classTitle");

const themeToggle =
document.getElementById("themeToggle");


/* ==========================
   THEME
========================== */

const savedTheme =
localStorage.getItem("maiamma-student-theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    themeToggle.innerHTML =
    '<i class="fas fa-sun"></i>';

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem(
            "maiamma-student-theme",
            "dark"
        );

        themeToggle.innerHTML =
        '<i class="fas fa-sun"></i>';

    } else {

        localStorage.setItem(
            "maiamma-student-theme",
            "light"
        );

        themeToggle.innerHTML =
        '<i class="fas fa-moon"></i>';

    }

});


/* ==========================
   LOAD TIMETABLE
========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        status.textContent =
        "Please login first.";

        return;

    }

    try {

        // Student Document

        const studentDoc =
        await getDoc(
            doc(db, "students", user.uid)
        );

        if (!studentDoc.exists()) {

            status.textContent =
            "Student record not found.";

            return;

        }

        const student =
        studentDoc.data();

        console.log(student);
console.log(
    student.studentClass +
    student.section
);

        const key =
student.studentClass + student.section;

        // Timetable Document

        const timetableDoc =
        await getDoc(
            doc(db, "timetables", key)
        );

        if (!timetableDoc.exists()) {

            status.textContent =
            "Timetable not available.";

            return;

        }

        const timetable =
        timetableDoc.data();

        timetableImage.src =
        timetable.imageUrl;

        timetableImage.style.display =
        "block";

        classTitle.textContent =
`${student.studentClass}-${student.section} Timetable`;

        status.style.display =
        "none";

    }

    catch (error) {

        console.error(error);

        status.textContent =
        "Failed to load timetable.";

    }

});