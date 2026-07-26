import { db } from "../js/firebase.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const classBox = document.getElementById("class");
const sectionBox = document.getElementById("section");
const imageUrl = document.getElementById("imageUrl");

const preview = document.getElementById("preview");

const previewBtn = document.getElementById("previewBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");


/* ==========================================
   AUTO GENERATE URL
========================================== */

function updateImageURL() {

    if (classBox.value && sectionBox.value) {

        imageUrl.value =
        `images/timetables/${classBox.value}${sectionBox.value}.png`;

    } else {

        imageUrl.value = "";

    }

}

classBox.addEventListener("change", updateImageURL);
sectionBox.addEventListener("change", updateImageURL);


/* ==========================================
   PREVIEW
========================================== */

previewBtn.addEventListener("click", () => {

    if (!imageUrl.value) {

        alert("Please select Class and Section.");

        return;

    }

    preview.src = imageUrl.value;

    preview.style.display = "block";

});


/* ==========================================
   SAVE TO FIRESTORE
========================================== */

saveBtn.addEventListener("click", async () => {

    const cls = classBox.value;
    const sec = sectionBox.value;

    if (!cls || !sec) {

        alert("Please select Class and Section.");

        return;

    }

    try {

        await setDoc(

            doc(db, "timetables", `${cls}${sec}`),

            {

                class: cls,

                section: sec,

                imageUrl: imageUrl.value,

                updatedOn: serverTimestamp()

            }

        );

        alert("Timetable Saved Successfully.");

    }

   catch (error) {

    console.error(error);

    alert(error.message);

}

});


/* ==========================================
   RESET
========================================== */

resetBtn.addEventListener("click", () => {

    classBox.selectedIndex = 0;

    sectionBox.selectedIndex = 0;

    imageUrl.value = "";

    preview.src = "";

    preview.style.display = "none";

});