
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("accordion-container");

  try {
    const response = await fetch("data/classes.json");
    const data = await response.json();

    Object.keys(data).forEach((year, idx) => {
      // Accordion head
      const yearDiv = document.createElement("div");
      yearDiv.className = "bg-white rounded-xl shadow-md overflow-hidden";

      yearDiv.innerHTML = `
        <button class="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-semibold bg-sky-100 hover:bg-sky-200 transition" data-accordion="head">
          <span>${year}</span>
          <span class="text-xl">+</span>
        </button>
        <div class="hidden px-4 py-3 space-y-4" data-accordion="body"></div>
      `;

      const body = yearDiv.querySelector("[data-accordion='body']");
      const headBtn = yearDiv.querySelector("[data-accordion='head']");

      headBtn.addEventListener("click", () => {
        body.classList.toggle("hidden");
        headBtn.querySelector("span:last-child").textContent =
          body.classList.contains("hidden") ? "+" : "−";
      });

      // Terms + Topics
      Object.keys(data[year]).forEach(term => {
        const termDiv = document.createElement("div");
        termDiv.innerHTML = `
          <h3 class="font-bold text-sky-700">${term.replace("-", " ").toUpperCase()}</h3>
          <ul class="list-disc list-inside space-y-1"></ul>
        `;
        const ul = termDiv.querySelector("ul");

        data[year][term].forEach(topic => {
          const li = document.createElement("li");
          li.innerHTML = `
            <a href="lessons.html?class=${encodeURIComponent(year)}&term=${encodeURIComponent(term)}&topic=${encodeURIComponent(topic.id)}"
               class="text-slate-700 hover:text-sky-600 transition">
              ${topic.title}
            </a>
          `;
          ul.appendChild(li);
        });

        body.appendChild(termDiv);
      });

      container.appendChild(yearDiv);
    });
  } catch (error) {
    container.innerHTML = `<p class="text-red-600">Error loading classes.json</p>`;
    console.error(error);
  }
});
