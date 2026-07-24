/* ===================================
   Teacher Menu
=================================== */

// Highlight tapped card on mobile

document.querySelectorAll(".menu-card").forEach(card => {

    card.addEventListener("click", function () {

        this.style.transform = "scale(0.96)";

        setTimeout(() => {
            this.style.transform = "";
        }, 120);

    });

});

// Disable image dragging

document.querySelectorAll("img").forEach(img => {
    img.draggable = false;
});

// Prevent text selection on rapid taps

document.body.style.userSelect = "none";