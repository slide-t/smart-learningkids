// js/lessons.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const className = params.get("class"); // e.g. Year1
  const topicId = params.get("topic");   // e.g. keyboard-mouse

  if (!className || !topicId) {
    document.getElementById("lesson-content").innerHTML = 
      `<p class="text-red-600">Lesson not found. Go back to <a href="classes.html" class="underline">Classes</a>.</p>`;
    return;
  }

  const lessonPath = `data/lessons/${className}/${topicId}.json`;

  fetch(lessonPath)
    .then(res => {
      if (!res.ok) throw new Error("Lesson file not found");
      return res.json();
    })
    .then(data => {
      renderLesson(data);
    })
    .catch(err => {
      document.getElementById("lesson-content").innerHTML = 
        `<p class="text-red-600">Error: ${err.message}</p>`;
    });
});

function renderLesson(data) {
  document.getElementById("lesson-title").textContent = data.title || "Lesson";

  const contentEl = document.getElementById("lesson-content");
  contentEl.innerHTML = `
    <div class="space-y-4">
      <div>
        <h2 class="text-xl font-bold mb-2">Lesson Content</h2>
        <ul class="list-disc pl-6 space-y-1">
          ${data.content.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      <div>
        <h2 class="text-xl font-bold mb-2">Examples</h2>
        <ul class="list-disc pl-6 space-y-1">
          ${data.examples.map(ex => `<li>${ex}</li>`).join("")}
        </ul>
      </div>
      <div>
        <h2 class="text-xl font-bold mb-2">Tasks</h2>
        <ul class="list-disc pl-6 space-y-1">
          ${data.tasks.map(task => `<li>${task}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}
