import { auth, db } from "../js/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ==========================
   ELEMENTS
========================== */

const examContainer =
document.querySelector("#examContainer");

const loading =
document.querySelector("#loading");

const emptyState =
document.querySelector("#emptyState");

const searchExam =
document.querySelector("#searchExam");

const totalExams =
document.querySelector("#totalExams");

const todayExams =
document.querySelector("#todayExams");

const upcomingExams =
document.querySelector("#upcomingExams");

const themeToggle =
document.querySelector("#themeToggle");


let student = {};

let exams = [];


/* ==========================
   THEME
========================== */

const savedTheme =
localStorage.getItem(
    "maiamma-student-theme"
);

if(savedTheme === "dark"){

    document.body.classList.add(
        "dark-mode"
    );

    updateThemeIcon();

}

themeToggle.addEventListener(

    "click",

    ()=>{

        document.body.classList.toggle(
            "dark-mode"
        );

        const dark =

        document.body.classList.contains(
            "dark-mode"
        );

        localStorage.setItem(

            "maiamma-student-theme",

            dark
            ? "dark"
            : "light"

        );

        updateThemeIcon();

    }

);

function updateThemeIcon(){

    const icon =

    themeToggle.querySelector("i");

    if(

        document.body.classList.contains(
            "dark-mode"
        )

    ){

        icon.className =
        "fas fa-sun";

    }

    else{

        icon.className =
        "fas fa-moon";

    }

}


/* ==========================
   AUTH
========================== */

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.href =
            "../login.html";

            return;

        }

        try{

            const studentSnap =

            await getDoc(

                doc(

                    db,

                    "students",

                    user.uid

                )

            );

            if(

                !studentSnap.exists()

            ){

                loading.style.display =
                "none";

                emptyState.style.display =
                "block";

                emptyState.innerHTML =

                `
                <i class="fas fa-user-xmark"></i>

                <h2>

                Student Record Not Found

                </h2>

                <p>

                Please contact your school administrator.

                </p>
                `;

                return;

            }

            student =
            studentSnap.data();

                        await loadExams();

        }

        catch(error){

            console.error(error);

            loading.style.display = "none";

            emptyState.style.display = "block";

            emptyState.innerHTML =

            `
            <i class="fas fa-triangle-exclamation"></i>

            <h2>

            Unable to Load Exams

            </h2>

            <p>

            Please try again later.

            </p>
            `;

        }

    }

);


/* ==========================
   LOAD EXAMS
========================== */

async function loadExams(){

    try{

        const examQuery = query(

            collection(db,"exams"),

            where(
                "className",
                "==",
                student.studentClass
            )

        );

        const snapshot =

        await getDocs(
            examQuery
        );

        exams =

        snapshot.docs

        .map(doc=>({

            id:doc.id,

            ...doc.data()

        }))

        .filter(item=>

            item.section ===
            student.section ||

            item.section ===
            "ALL"

        );

        exams.sort(

            (a,b)=>

            (a.examDate || "")
            .localeCompare(

                b.examDate || ""

            )

        );

        renderExams();

    }

    catch(error){

        console.error(error);

        loading.style.display =
        "none";

        emptyState.style.display =
        "block";

        emptyState.innerHTML =

        `
        <i class="fas fa-circle-exclamation"></i>

        <h2>

        Error Loading Exams

        </h2>

        <p>

        Please refresh the page.

        </p>
        `;

    }

}

/* ==========================
   RENDER EXAMS
========================== */

function renderExams(){

    loading.style.display = "none";

    const keyword =
    searchExam.value
    .trim()
    .toLowerCase();

    const filtered =

    exams.filter(item =>

        `${item.examName}
        ${item.subject}
        ${item.className}
        ${item.section}`

        .toLowerCase()

        .includes(keyword)

    );

    totalExams.textContent =
    filtered.length;

    const today =
    new Date()
    .toISOString()
    .slice(0,10);

    todayExams.textContent =

    filtered.filter(

        exam =>

        exam.examDate === today

    ).length;

    upcomingExams.textContent =

    filtered.filter(

        exam =>

        exam.examDate >= today

    ).length;


    if(filtered.length === 0){

        examContainer.innerHTML = "";

        emptyState.style.display =
        "block";

        return;

    }

    emptyState.style.display =
    "none";

    examContainer.innerHTML =

    filtered.map(exam=>{

        const status =

        getStatus(exam.examDate);

        return `

<div class="exam-card">

    <div class="exam-header">

        <div>

            <h2>

                ${escapeHTML(exam.examName)}

            </h2>

            <span>

                ${escapeHTML(exam.subject)}

            </span>

        </div>

        <div class="status ${status.class}">

            ${status.text}

        </div>

    </div>

    <div class="exam-body">

        <div>

            <i class="fas fa-users"></i>

            Class

            ${exam.className}-${exam.section}

        </div>

        <div>

            <i class="fas fa-calendar"></i>

            ${formatDate(exam.examDate)}

        </div>

        <div>

            <i class="fas fa-stopwatch"></i>

            ${escapeHTML(exam.duration)}

        </div>

        <div>

            <i class="fas fa-square-poll-vertical"></i>

            ${exam.maxMarks} Marks

        </div>

        <div>

            <i class="fas fa-user"></i>

            ${escapeHTML(

                exam.teacherName ||

                "Teacher"

            )}

        </div>

    </div>

</div>

`;

    }).join("");

}

/* ==========================
   SEARCH
========================== */

searchExam.addEventListener(

    "input",

    renderExams

);


/* ==========================
   STATUS
========================== */

function getStatus(date){

    const today =

    new Date()
    .toISOString()
    .slice(0,10);

    if(date === today){

        return{

            text:"Today",

            class:"today"

        };

    }

    if(date > today){

        return{

            text:"Upcoming",

            class:"upcoming"

        };

    }

    return{

        text:"Completed",

        class:"completed"

    };

}


/* ==========================
   DATE FORMAT
========================== */

function formatDate(date){

    if(!date) return "-";

    return new Date(date)

    .toLocaleDateString(

        "en-IN",

        {

            day:"numeric",

            month:"short",

            year:"numeric"

        }

    );

}


/* ==========================
   ESCAPE HTML
========================== */

function escapeHTML(text){

    const div =

    document.createElement("div");

    div.textContent =

    text || "";

    return div.innerHTML;

}