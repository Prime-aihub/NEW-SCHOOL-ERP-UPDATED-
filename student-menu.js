/* ===================================
   Student Menu
=================================== */

// Card Click Animation

document.querySelectorAll(".menu-card").forEach(card=>{

    card.addEventListener("click",function(){

        this.style.transform="scale(0.96)";

        setTimeout(()=>{
            this.style.transform="";
        },120);

    });

});

// Disable Image Dragging

document.querySelectorAll("img").forEach(img=>{

    img.draggable=false;

});

// Disable Text Selection

document.body.style.userSelect="none";