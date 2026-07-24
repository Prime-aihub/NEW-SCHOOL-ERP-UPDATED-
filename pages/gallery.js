// =====================================
// FIREBASE IMPORTS
// =====================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {

getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
doc,
serverTimestamp

}

from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyA5okPgG0LaZ9zr-LUPyZGrGcHxs4VKK70",
  authDomain: "maiamma-school-erp.firebaseapp.com",
  projectId: "maiamma-school-erp",
  storageBucket: "maiamma-school-erp.firebasestorage.app",
  messagingSenderId: "692499577063",
  appId: "1:692499577063:web:a92e6d46cad6ddba304a42",
  measurementId: "G-6Q6PQ9E2R2"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// =====================================
// FORM
// =====================================

const galleryForm = document.getElementById("galleryForm");

const message = document.getElementById("message");


// =====================================
// SAVE PHOTO
// =====================================

galleryForm.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const year =
    document.getElementById("year").value;

    const event =
    document.getElementById("event").value;

    const className =
    document.getElementById("className").value;

    const imageUrl =
    document.getElementById("imageUrl").value.trim();

    const title =
    document.getElementById("title").value.trim();

    if(imageUrl===""){

        alert("Please enter Photo URL");

        return;

    }

    try{

        await addDoc(

            collection(db,"galleryPhotos"),

            {

                year,

                event,

                className,

                imageUrl,

                title,

                createdAt:serverTimestamp()

            }

        );

        message.innerHTML="✅ Photo Saved Successfully";

        galleryForm.reset();

loadGallery();

    }

    catch(error){

        console.error(error);

        message.innerHTML="❌ Failed to Save";

    }

});

// =====================================
// GALLERY GRID
// =====================================

const galleryGrid =
document.getElementById("galleryGrid");


// =====================================
// LOAD GALLERY
// =====================================



async function loadGallery(){

    galleryGrid.innerHTML="";

    try{

        const snapshot =
        await getDocs(
            collection(db,"galleryPhotos")
        );

        snapshot.forEach((doc)=>{

            const data = doc.data();

            galleryGrid.innerHTML += `

            <div class="gallery-card">

                <img
                    src="${data.imageUrl}"
                    alt="${data.title}">

                <div class="gallery-info">

                    <h3>${data.title}</h3>

                    <p>

                        <strong>Year :</strong>

                        ${data.year}

                    </p>

                    <p>

                        <strong>Event :</strong>

                        ${data.event}

                    </p>

                    <p>

                        <strong>Class :</strong>

                        ${data.className}

                    </p>

                    <div class="gallery-buttons">

                        <button
                            class="delete-btn"
                            data-id="${doc.id}">

                            <i class="fa-solid fa-trash"></i>

                            Delete

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}


// =====================================
// LOAD WHEN PAGE OPENS
// =====================================

loadGallery();

// =====================================
// DELETE PHOTO
// =====================================

galleryGrid.addEventListener("click", async (e) => {

    const button = e.target.closest(".delete-btn");

    if (!button) return;

    const id = button.dataset.id;

    const confirmDelete = confirm("Delete this photo?");

    if (!confirmDelete) return;

    try {

        await deleteDoc(doc(db, "galleryPhotos", id));

        message.innerHTML = "✅ Photo Deleted Successfully";

        loadGallery();

    }

    catch (error) {

        console.error(error);

        message.innerHTML = "❌ Failed to Delete";

    }

});