// /js/classes.js

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("classes-container");

  // Fetch JSON data
  fetch("data/classes.json")
    .then((res) => res.json())
    .then((data) => {
      displayClasses(data, container);
    })
    .catch((err) => console.error("Error loading classes:", err));
});

function displayClasses(classes, container) {
  classes.forEach((cls) => {
    // Accordion item
    const item = document.createElement("div");
    item.classList.add("accordion-item");

    // Accordion header
    const header = document.createElement("button");
    header.classList.add("accordion-header");
    header.textContent = cls.name;
    header.addEventListener("click", () => {
      header.classList.toggle("active");
      body.classList.toggle("open");
    });

    // Accordion body
    const body = document.createElement("div");
    body.classList.add("accordion-body");

    // Topics list
    const ul = document.createElement("ul");

    cls.topics.forEach((topic) => {
      const li = document.createElement("li");
      li.textContent = topic;

      // For Year 7–12 → Practice Board (HTML, CSS, JS tabs)
      if (cls.id >= 7) {
        const board = document.createElement("div");
        board.classList.add("practice-board");

        board.innerHTML = `
          <div class="tabs">
            <button class="tab-btn active" data-tab="html">HTML</button>
            <button class="tab-btn" data-tab="css">CSS</button>
            <button class="tab-btn" data-tab="js">JavaScript</button>
          </div>
          <div class="tab-content">
            <textarea class="code-editor" data-lang="html" placeholder="Write HTML code..."></textarea>
            <textarea class="code-editor hidden" data-lang="css" placeholder="Write CSS code..."></textarea>
            <textarea class="code-editor hidden" data-lang="js" placeholder="Write JavaScript code..."></textarea>
          </div>
        `;

        li.appendChild(board);

        // Tab functionality
        const tabs = board.querySelectorAll(".tab-btn");
        const editors = board.querySelectorAll(".code-editor");

        tabs.forEach((tab) => {
          tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            editors.forEach((ed) => ed.classList.add("hidden"));

            tab.classList.add("active");
            const lang = tab.dataset.tab;
            board.querySelector(`.code-editor[data-lang="${lang}"]`).classList.remove("hidden");
          });
        });
      }

      ul.appendChild(li);
    });

    body.appendChild(ul);
    item.appendChild(header);
    item.appendChild(body);
    container.appendChild(item);
  });
}
