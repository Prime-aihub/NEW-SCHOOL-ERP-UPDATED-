/* ==========================================
   MAIAMMA SCHOOL HUB
   ANNOUNCEMENT WIDGET
========================================== */

import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ==========================
   ELEMENTS
========================== */

const announcementBtn =
document.getElementById("announcementBtn");

const announcementPopup =
document.getElementById("announcementPopup");

const announcementList =
document.getElementById("announcementList");

const announcementCount =
document.getElementById("announcementCount");

/* ==========================
   SAFETY CHECK
========================== */

if (
    announcementBtn &&
    announcementPopup &&
    announcementList &&
    announcementCount
){

    announcementBtn.addEventListener("click",()=>{

        announcementPopup.classList.toggle("show");

    });

    document.addEventListener("click",(e)=>{

        if(
            !announcementBtn.contains(e.target) &&
            !announcementPopup.contains(e.target)
        ){

            announcementPopup.classList.remove("show");

        }

    });

    loadAnnouncements();

}

/* ==========================
   LOAD ANNOUNCEMENTS
========================== */

async function loadAnnouncements(){

    try{

        const q = query(

    collection(db,"announcements"),

    limit(5)

);

        const snapshot = await getDocs(q);

        announcementList.innerHTML = "";

        announcementCount.textContent = snapshot.size;

        if(snapshot.size === 0){

            announcementCount.style.display = "none";

            announcementList.innerHTML =

            `<div class="notice-item">
                No announcements available.
            </div>`;

            return;

        }

        announcementCount.style.display = "flex";

        snapshot.forEach(doc=>{

            const data = doc.data();

            announcementList.innerHTML += `

            <div class="notice-item">

                <strong>${data.title || "Announcement"}</strong>

                <p style="margin-top:6px;">
                    ${data.description || ""}
                </p>

            </div>

            `;

        });

    }

    catch(error){

        console.error(
            "Announcement Error:",
            error
        );

        announcementList.innerHTML =

        `<div class="notice-item">
            Unable to load announcements.
        </div>`;

    }

}