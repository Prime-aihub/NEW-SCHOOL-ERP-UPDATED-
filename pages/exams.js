import { auth, db } from "../js/firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const examForm =
document.querySelector("#examForm");

const formCard =
document.querySelector("#formCard");

const examRows =
document.querySelector("#examRows");

const notice =
document.querySelector("#notice");

const showFormButton =
document.querySelector("#showForm");

const closeFormButton =
document.querySelector("#closeForm");

const searchExam =
document.querySelector("#searchExam");


let exams = [];

let teacher = {};

const today =
new Date().toISOString().slice(0,10);


/* ==========================
   AUTH
========================== */

onAuthStateChanged(

    auth,

    async user => {

        if(!user){

            window.location.href =
            "../login.html";

            return;

        }

        try{

            const teacherSnap =
            await getDoc(

                doc(
                    db,
                    "teachers",
                    user.uid
                )

            );

            if(
                teacherSnap.exists()
            ){

                teacher =
                teacherSnap.data();

            }

            await loadExams();

        }

        catch(error){

            console.error(error);

            notice.textContent =
            "Unable to load exams.";

        }

    }

);


/* ==========================
   ESCAPE HTML
========================== */

function escapeText(value){

    const div =
    document.createElement("div");

    div.textContent =
    value || "";

    return div.innerHTML;

}


/* ==========================
   LOAD EXAMS
========================== */

async function loadExams(){

    examRows.innerHTML =

    `
    <tr>

        <td colspan="6"
            class="empty">

            Loading Exams...

        </td>

    </tr>
    `;

    const examQuery =

    query(

        collection(
            db,
            "exams"
        ),

        where(
            "teacherId",
            "==",
            auth.currentUser.uid
        )

    );

    const snapshot =

    await getDocs(
        examQuery
    );

    exams =

    snapshot.docs.map(item => ({

        id:item.id,

        ...item.data()

    }));


    exams.sort(

        (a,b)=>

        (a.examDate || "")
        .localeCompare(

            b.examDate || ""

        )

    );

    render();

}


/* ==========================
   RENDER
========================== */

function render(){

    const keyword =

    searchExam.value
    .toLowerCase()
    .trim();

    const shown =

    exams.filter(item=>

        `${item.examName}
        ${item.subject}
        ${item.className}
        ${item.section}`

        .toLowerCase()

        .includes(keyword)

    );

    examRows.innerHTML =

    shown.length ?

    shown.map(item=>`

<tr>

<td>

${escapeText(item.examName)}

</td>

<td>

${escapeText(item.subject)}

</td>

<td>

Class
${escapeText(item.className)}
-
${escapeText(item.section)}

</td>

<td>

${item.examDate}

</td>

<td>

${item.maxMarks}

</td>

<td>

${escapeText(item.duration)}

</td>

</tr>

`).join("")

:

`

<tr>

<td
colspan="6"
class="empty">

No Exams Found.

</td>

</tr>

`;

    document.querySelector(
        "#totalExams"
    ).textContent =

    exams.length;

    document.querySelector(
        "#upcomingExams"
    ).textContent =

    exams.filter(item=>

        item.examDate >= today

    ).length;

    const subjects =

    new Set(

        exams.map(item=>

            item.subject
            .toLowerCase()

        )

    );

    document.querySelector(
        "#subjectsCount"
    ).textContent =

    subjects.size;

}

/* ==========================
   FORM BUTTONS
========================== */

showFormButton.onclick = () => {

    formCard.classList.remove(
        "hidden"
    );

};

closeFormButton.onclick = () => {

    formCard.classList.add(
        "hidden"
    );

};


/* ==========================
   SAVE EXAM
========================== */

examForm.onsubmit = async event => {

    event.preventDefault();

    const saveButton =

    examForm.querySelector(

        'button[type="submit"]'

    );

    saveButton.disabled = true;

    saveButton.textContent =
    "Saving...";

    try{

        await addDoc(

            collection(
                db,
                "exams"
            ),

            {

                examName:

                document.querySelector(
                    "#examName"
                ).value.trim(),

                subject:

                document.querySelector(
                    "#subject"
                ).value.trim(),

                className:

                document.querySelector(
                    "#className"
                ).value,

                section:

                document.querySelector(
                    "#section"
                ).value,

                examDate:

                document.querySelector(
                    "#examDate"
                ).value,

                maxMarks:

                document.querySelector(
                    "#maxMarks"
                ).value,

                duration:

                document.querySelector(
                    "#duration"
                ).value.trim(),

                teacherId:
                auth.currentUser.uid,

                teacherName:

                teacher.teacherName ||

                teacher.name ||

                "Teacher",

                createdAt:
                serverTimestamp()

            }

        );

        examForm.reset();

        formCard.classList.add(
            "hidden"
        );

        notice.textContent =
        "Exam published successfully.";

        await loadExams();

    }

    catch(error){

        console.error(error);

        notice.textContent =
        "Unable to save exam.";

    }

    finally{

        saveButton.disabled = false;

        saveButton.textContent =
        "Save Exam";

    }

};


/* ==========================
   SEARCH
========================== */

searchExam.oninput = render;
