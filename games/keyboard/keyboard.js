// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("keyboard-game");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");
  const homeBtn = document.getElementById("home-btn");

  // Get topic from query string
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  // Game content mapped from classes.json
  const games = {
    "home-row": {
      title: "Home Row Practice",
      instructions: "Practice typing the home row keys: a, s, d, f, j, k, l, ;",
      content: ["a", "s", "d", "f", "j", "k", "l", ";"]
    },
    "two-letter": {
      title: "Type Two-Letter Words",
      instructions: "Type the two-letter words shown.",
      content: ["at", "on", "in", "up", "to", "it"]
    },
    "three-letter": {
      title: "Type Three-Letter Words",
      instructions: "Type the three-letter words shown.",
      content: ["cat", "dog", "sun", "pen", "car"]
    },

    "simple-words": {
      title: "Typing Simple Words",
      instructions: "Type each word correctly.",
      content: ["book", "chair", "table", "plant", "water"]
    },
    "short-sentences": {
      title: "Typing Short Sentences",
      instructions: "Type these short sentences.",
      content: ["I am happy.", "We play ball.", "The cat runs."]
    },
    "simple-paragraphs": {
      title: "Typing Simple Paragraphs",
      instructions: "Type the paragraph as shown.",
      content: [
        "My name is Ada. I love to read books. I go to school every day."
      ]
    // ... (rest of your topics unchanged)
  };

  // Function to initialize the game
  function initGame(game) {
    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">${game.title}</h2>
      <p class="mb-4">${game.instructions}</p>
      <div id="game-content" class="p-4 border rounded bg-gray-100">
        <p id="prompt" class="text-lg font-mono"></p>
        <input id="typing-input" class="mt-2 p-2 border rounded w-full" placeholder="Start typing here..." />
        <p id="feedback" class="mt-2 text-sm"></p>
      </div>
    `;

    let index = 0;
    const promptEl = document.getElementById("prompt");
    const inputEl = document.getElementById("typing-input");
    const feedbackEl = document.getElementById("feedback");

    function loadPrompt() {
      if (index < game.content.length) {
        promptEl.textContent = game.content[index];
        inputEl.value = "";
        feedbackEl.textContent = "";
      } else {
        promptEl.textContent = "Well done! 🎉 You finished this topic.";
        inputEl.disabled = true;
      }
    }

    inputEl.addEventListener("input", () => {
      if (inputEl.value === game.content[index]) {
        feedbackEl.textContent = "✅ Correct!";
        feedbackEl.className = "text-green-600 mt-2 text-sm";
        index++;
        setTimeout(loadPrompt, 1000);
      } else {
        feedbackEl.textContent = "⏳ Keep typing...";
        feedbackEl.className = "text-blue-600 mt-2 text-sm";
      }
    });

    loadPrompt();
  }

  // Start button logic
  if (startBtn && topic && games[topic]) {
    startBtn.addEventListener("click", () => {
      startBtn.style.display = "none"; // hide start button after click
      initGame(games[topic]);
    });
  } else if (!games[topic]) {
    container.innerHTML = `<p class="text-red-600">❌ Invalid topic. Please go back and select again.</p>`;
  }

  // Button handlers
  if (restartBtn) restartBtn.addEventListener("click", () => location.reload());
  if (backBtn) backBtn.addEventListener("click", () => window.location.href = "classes.html");
  if (homeBtn) homeBtn.addEventListener("click", () => window.location.href = "index.html");
});
