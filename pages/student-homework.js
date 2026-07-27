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


const homeworkContainer =
document.getElementById("homeworkContainer");

const loading =
document.getElementById("loading");

const emptyState =
document.getElementById("emptyState");

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

themeToggle.onclick = () => {

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

};


/* ==========================
   LOAD HOMEWORK
========================== */

onAuthStateChanged(auth, async user => {

    if (!user) {

        window.location.href =
        "../login.html";

        return;

    }

    try {

        const studentSnap =
        await getDoc(
            doc(db, "students", user.uid)
        );

        console.log("UID:", user.uid);
console.log("Student Exists:", studentSnap.exists());

if(studentSnap.exists()){
    console.log(studentSnap.data());
}

        if (!studentSnap.exists()) {

            loading.style.display =
            "none";

            emptyState.style.display =
            "block";

            return;

        }

        const student =
        studentSnap.data();

        console.log("Class:", student.studentClass);
console.log("Section:", student.section);

        const homeworkQuery =
        query(

            collection(db, "homework"),

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
            homeworkQuery
        );

        console.log("Homework Count:", snapshot.size);

        loading.style.display =
        "none";

        if (snapshot.empty) {

            emptyState.style.display =
            "block";

            return;

        }

        homeworkContainer.innerHTML =
        "";

        snapshot.forEach(docSnap => {

            const item =
            docSnap.data();

            homeworkContainer.innerHTML +=

            `
            <div class="homework-card">

                <span class="subject">

                    ${item.subject}

                </span>

                <h3>

                    Homework

                </h3>

                <p>

                    ${item.details}

                </p>

                <div class="info">

                    <span>

                        <i class="fas fa-user"></i>

                        ${item.teacherName}

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

    catch (error) {

        console.error(error);

        loading.style.display =
        "none";

        emptyState.style.display =
        "block";

    }

});