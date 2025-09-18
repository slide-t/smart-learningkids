// js/classes.js

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/classes.json")
    .then(res => res.json())
    .then(classesData => {
      renderAccordion(classesData);
    })
    .catch(err => {
      document.getElementById("accordion").innerHTML =
        `<p class="text-red-600">Error loading classes: ${err.message}</p>`;
    });
});

function renderAccordion(classesData) {
  const accordion = document.getElementById("accordion");
  accordion.innerHTML = "";

  classesData.forEach(cls => {
    // Accordion header
    const headerId = `accordion-header-${cls.id}`;
    const bodyId = `accordion-body-${cls.id}`;
    const wrapper = document.createElement("div");

    wrapper.innerHTML = `
      <div class="border rounded-lg shadow-sm bg-white">
        <button id="${headerId}" 
                class="w-full text-left px-4 py-3 font-semibold flex justify-between items-center hover:bg-slate-50 transition"
                data-target="${bodyId}">
          <span>${cls.name}</span>
          <span class="transform transition-transform">+</span>
        </button>
        <div id="${bodyId}" class="hidden px-4 py-2 space-y-3">
          ${cls.terms.map(term => `
            <div>
              <h4 class="font-medium text-indigo-600">${term.term}</h4>
              <ul class="list-disc pl-6 space-y-1">
                ${term.topics.map(topic => `
                  <li>
                    <a href="lessons.html?class=${encodeURIComponent(cls.id)}&topic=${encodeURIComponent(topic.id)}"
                       class="text-slate-700 hover:text-indigo-600 hover:underline">
                      ${topic.title}
                    </a>
                  </li>
                `).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    accordion.appendChild(wrapper);
  });

  // Attach accordion behavior
  initAccordion();
}
