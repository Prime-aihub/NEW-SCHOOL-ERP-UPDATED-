import { auth, db } from "../js/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const assignmentContainer =
document.getElementById("assignmentContainer");

const loading =
document.getElementById("loading");

const emptyState =
document.getElementById("emptyState");

const searchInput =
document.getElementById("searchAssignment");

const totalAssignments =
document.getElementById("totalAssignments");

const pendingAssignments =
document.getElementById("pendingAssignments");

const dueToday =
document.getElementById("dueToday");

const themeToggle =
document.getElementById("themeToggle");


/* ==========================
   THEME
========================== */

const savedTheme =
localStorage.getItem(
    "maiamma-student-theme"
);

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.innerHTML =
    '<i class="fas fa-sun"></i>';

}

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );

        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {

            localStorage.setItem(
                "maiamma-student-theme",
                "dark"
            );

            themeToggle.innerHTML =
            '<i class="fas fa-sun"></i>';

        }

        else {

            localStorage.setItem(
                "maiamma-student-theme",
                "light"
            );

            themeToggle.innerHTML =
            '<i class="fas fa-moon"></i>';

        }

    }
);


let assignments = [];


/* ==========================
   LOAD ASSIGNMENTS
========================== */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
            "../login.html";

            return;

        }

        try {

            const studentSnap =
            await getDoc(
                doc(
                    db,
                    "students",
                    user.uid
                )
            );

            if (
                !studentSnap.exists()
            ) {

                loading.style.display =
                "none";

                emptyState.style.display =
                "block";

                return;

            }

            const student =
            studentSnap.data();

            const assignmentQuery =
            query(

                collection(
                    db,
                    "assignments"
                ),

                where(
                    "className",
                    "==",
                    student.studentClass
                ),

                where(
                    "section",
                    "==",
                    student.section
                )

            );

            const snapshot =
            await getDocs(
                assignmentQuery
            );

            assignments =
            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));

            loading.style.display =
            "none";

            renderAssignments();

        }

        catch (error) {

            console.error(error);

            loading.style.display =
            "none";

            emptyState.style.display =
            "block";

        }

    }
);


/* ==========================
   RENDER
========================== */

function renderAssignments() {

    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();

    const today =
    new Date()
    .toISOString()
    .slice(0, 10);

    const filtered =
    assignments.filter(item =>

        `${item.subject}
        ${item.title}
        ${item.details}`
        .toLowerCase()
        .includes(keyword)

    );

    assignmentContainer.innerHTML =
    "";

    if (
        filtered.length === 0
    ) {

        emptyState.style.display =
        "block";

        totalAssignments.textContent =
        "0";

        pendingAssignments.textContent =
        "0";

        dueToday.textContent =
        "0";

        return;

    }

    emptyState.style.display =
    "none";

    totalAssignments.textContent =
    filtered.length;

    pendingAssignments.textContent =
    filtered.filter(item =>
        item.dueDate >= today
    ).length;

    dueToday.textContent =
    filtered.filter(item =>
        item.dueDate === today
    ).length;

    filtered.sort((a, b) =>
        (a.dueDate || "")
        .localeCompare(
            b.dueDate || ""
        )
    );

    filtered.forEach(item => {

        assignmentContainer.innerHTML +=

        `
        <div class="assignment-card">

            <span class="subject">

                ${item.subject}

            </span>

            <h3>

                ${item.title || "Assignment"}

            </h3>

            <p>

                ${item.details}

            </p>

            <div class="info">

                <span>

                    <i class="fas fa-user"></i>

                    ${item.teacherName || "Teacher"}

                </span>

                <span>

                    <i class="fas fa-calendar"></i>

                    ${item.dueDate}

                </span>

            </div>

        </div>
        `;

    });

}


/* ==========================
   SEARCH
========================== */

searchInput.addEventListener(
    "input",
    renderAssignments
);