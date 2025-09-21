// mouse.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const optionsContainer = document.getElementById("options-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  let topicIndex = 0;
  let topics = []; // Loaded from JSON
  let currentClick = 0;
  const maxClicks = 5;

  // Load topics dynamically from mouse.json
  fetch("mouse.json")
    .then(res => res.json())
    .then(data => {
      topics = data;
      startTopic();
    })
    .catch(err => console.error("Error loading mouse.json:", err));

  function startTopic() {
    currentClick = 0;
    feedback.textContent = "";
    nextButton.classList.add("hidden");
    optionsContainer.innerHTML = "";

    if (topicIndex >= topics.length) {
      questionContainer.innerHTML = `<h2>🎉 Congratulations! You completed all Mouse topics.</h2>`;
      return;
    }

    const topic = topics[topicIndex];

    questionContainer.innerHTML = `
      <h2>${topic.title}</h2>
      <p>${topic.description}</p>
    `;

    if (topic.type === "emoji") {
      createEmojiPractice(topic);
    } else if (topic.type === "shape") {
      createShapePractice(topic);
    }
  }

  function createEmojiPractice(topic) {
    const board = optionsContainer;
    const emoji = document.createElement("div");
    emoji.textContent = topic.icon || "🖱️";
    emoji.style.position = "absolute";
    emoji.style.fontSize = "40px";
    emoji.style.cursor = "pointer";
    board.appendChild(emoji);

    moveEmoji();

    emoji.addEventListener("click", () => {
      currentClick++;
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";

      if (currentClick >= maxClicks) {
        emoji.remove();
        showNextButton();
      } else {
        moveEmoji();
      }
    });

    // Fail click outside emoji
    board.addEventListener("click", e => {
      if (e.target !== emoji) {
        feedback.textContent = "❌ Wrong! Click the emoji.";
        feedback.style.color = "red";
      }
    });
  }

  function moveEmoji() {
    const board = optionsContainer;
    const emoji = board.querySelector("div");
    const maxX = board.clientWidth - 50;
    const maxY = board.clientHeight - 50;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    emoji.style.left = `${x}px`;
    emoji.style.top = `${y}px`;
  }

  function createShapePractice(topic) {
    const board = optionsContainer;
    const shapes = ["⬛", "🔺", "⚪", "🔷", "⭐"];
    board.innerHTML = "";

    for (let i = 0; i < maxClicks; i++) {
      const shape = document.createElement("div");
      shape.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      shape.style.position = "absolute";
      shape.style.fontSize = "40px";
      shape.style.cursor = "pointer";
      board.appendChild(shape);

      const x = Math.floor(Math.random() * (board.clientWidth - 50));
      const y = Math.floor(Math.random() * (board.clientHeight - 50));
      shape.style.left = `${x}px`;
      shape.style.top = `${y}px`;

      shape.addEventListener("click", () => {
        currentClick++;
        feedback.textContent = "✅ Correct!";
        feedback.style.color = "green";
        shape.remove();

        if (currentClick >= maxClicks) {
          showNextButton();
        }
      });
    }

    // Fail click outside shapes
    board.addEventListener("click", e => {
      if (![...board.children].includes(e.target)) {
        feedback.textContent = "❌ Wrong! Click the shapes.";
        feedback.style.color = "red";
      }
    });
  }

  function showNextButton() {
    feedback.textContent = "🎉 Well done!";
    nextButton.classList.remove("hidden");
    nextButton.textContent = "Next Topic";
    nextButton.onclick = () => {
      topicIndex++;
      startTopic();
    };
  }
});
