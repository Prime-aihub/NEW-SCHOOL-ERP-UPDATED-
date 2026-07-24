// =====================================
// FIREBASE IMPORTS
// =====================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {

getFirestore,
collection,
getDocs

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
// ELEMENTS
// =====================================

const galleryGrid =
document.getElementById("galleryGrid");

const yearFilter =
document.getElementById("yearFilter");

const eventFilter =
document.getElementById("eventFilter");

const clearFilters =
document.getElementById("clearFilters");

const lightbox =
document.getElementById("lightbox");

const lightboxImage =
document.getElementById("lightboxImage");

const lightboxTitle =
document.getElementById("lightboxTitle");

const closeLightbox =
document.getElementById("closeLightbox");

let galleryData = [];


// =====================================
// LOAD GALLERY
// =====================================

async function loadGallery(){

galleryGrid.innerHTML="";

galleryData=[];

const years = new Set();

const events = new Set();

try{

const snapshot =
await getDocs(
collection(db,"galleryPhotos")
);

snapshot.forEach((doc)=>{

const data = doc.data();

galleryData.push(data);

years.add(data.year);

events.add(data.event);

});

populateFilters(years,events);

displayGallery(galleryData);

}

catch(error){

console.error(error);

}

}


// =====================================
// FILTER LIST
// =====================================

function populateFilters(years,events){

yearFilter.innerHTML=
`<option value="">All Academic Years</option>`;

eventFilter.innerHTML=
`<option value="">All Events</option>`;

[...years].sort().forEach(year=>{

yearFilter.innerHTML+=

`<option value="${year}">${year}</option>`;

});

[...events].sort().forEach(event=>{

eventFilter.innerHTML+=

`<option value="${event}">${event}</option>`;

});

}


// =====================================
// DISPLAY GALLERY
// =====================================

function displayGallery(list){

galleryGrid.innerHTML="";

if(list.length===0){

galleryGrid.innerHTML=

`<h2>No Photos Found</h2>`;

return;

}

list.forEach(photo=>{

galleryGrid.innerHTML+=`

<div class="gallery-card">

<img
src="${photo.imageUrl}"
alt="${photo.title}">

<div class="gallery-content">

<h3>${photo.title}</h3>

<p>

<strong>Year :</strong>

${photo.year}

</p>

<p>

<strong>Event :</strong>

${photo.event}

</p>

<p>

<strong>Class :</strong>

${photo.className}

</p>

</div>

</div>

`;

});

attachImageEvents();

}


// =====================================
// FILTERS
// =====================================

function applyFilters(){

const year =
yearFilter.value;

const event =
eventFilter.value;

const filtered =

galleryData.filter(photo=>{

const yearMatch =
year==="" || photo.year===year;

const eventMatch =
event==="" || photo.event===event;

return yearMatch && eventMatch;

});

displayGallery(filtered);

}

yearFilter.addEventListener(
"change",
applyFilters
);

eventFilter.addEventListener(
"change",
applyFilters
);

clearFilters.addEventListener("click",()=>{

yearFilter.value="";

eventFilter.value="";

displayGallery(galleryData);

});


// =====================================
// LIGHTBOX
// =====================================

function attachImageEvents(){

const images =
document.querySelectorAll(".gallery-card img");

images.forEach(img=>{

img.addEventListener("click",()=>{

lightbox.classList.add("active");

lightboxImage.src=img.src;

lightboxTitle.innerHTML=

img.parentElement.querySelector("h3").innerHTML;

});

});

}

closeLightbox.addEventListener("click",()=>{

lightbox.classList.remove("active");

});

lightbox.addEventListener("click",(e)=>{

if(e.target===lightbox){

lightbox.classList.remove("active");

}

});


// =====================================
// START
// =====================================

loadGallery();