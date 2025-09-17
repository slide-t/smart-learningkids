// js/accordion.js
function initAccordion() {
  const headers = document.querySelectorAll(".accordion-header");

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const body = header.nextElementSibling;

      // Close other open accordions
      document.querySelectorAll(".accordion-body").forEach(panel => {
        if (panel !== body) {
          panel.classList.add("hidden");
          panel.style.maxHeight = null;
        }
      });

      // Toggle the clicked accordion
      if (body.classList.contains("hidden")) {
        body.classList.remove("hidden");
        body.style.maxHeight = body.scrollHeight + "px";
      } else {
        body.classList.add("hidden");
        body.style.maxHeight = null;
      }
    });
  });
}
