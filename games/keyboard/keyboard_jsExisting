// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("keyboard-game");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");
  const homeBtn = document.getElementById("home-btn");

  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  // Your keyboard lessons
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
    // Add other topics as needed...
  };

  // Validate topic
  if (!topic || !games[topic]) {
    container.innerHTML = `<p class="text-red-600">❌ Invalid topic. Please go back and select again.</p>`;
    return;
  }

  const game = games[topic];
  let index = 0;
  let score = 0;

  // Render game interface
  container.innerHTML = `
    <h2 class="text-2xl font-bold mb-4">${game.title}</h2>
    <p class="mb-4">${game.instructions}</p>
    <div id="game-content" class="p-4 border rounded bg-gray-100 w-full">
      <p id="prompt" class="text-lg font-mono mb-2"></p>
      <input id="typing-input" class="mt-2 p-2 border rounded w-full" placeholder="Start typing here..." autocomplete="off" />
      <p id="feedback" class="mt-2 text-sm"></p>
      <div class="flex justify-between mt-4">
        <span id="score-display" class="font-semibold">Score: 0</span>
        <span id="progress-display" class="font-semibold">0 / ${game.content.length}</span>
      </div>
    </div>
  `;

  const promptEl = document.getElementById("prompt");
  const inputEl = document.getElementById("typing-input");
  const feedbackEl = document.getElementById("feedback");
  const scoreDisplay = document.getElementById("score-display");
  const progressDisplay = document.getElementById("progress-display");

  // Load prompt
  function loadPrompt() {
    if (index < game.content.length) {
      promptEl.textContent = game.content[index];
      inputEl.value = "";
      inputEl.disabled = false;
      inputEl.focus();
      feedbackEl.textContent = "";
      progressDisplay.textContent = `${index} / ${game.content.length}`;
    } else {
      promptEl.textContent = "🎉 Well done! You finished this topic.";
      inputEl.disabled = true;
      feedbackEl.textContent = `Final Score: ${score}`;
      progressDisplay.textContent = `${game.content.length} / ${game.content.length}`;
    }
  }

  // Typing input logic
  inputEl.addEventListener("input", () => {
    if (inputEl.value === game.content[index]) {
      feedbackEl.textContent = "✅ Correct!";
      feedbackEl.className = "text-green-600 mt-2 text-sm";
      score += 10;
      scoreDisplay.textContent = `Score: ${score}`;
      index++;
      setTimeout(loadPrompt, 800);
    } else {
      feedbackEl.textContent = "⏳ Keep typing...";
      feedbackEl.className = "text-blue-600 mt-2 text-sm";
    }
  });

  // Initialize first prompt
  loadPrompt();

  // Button handlers
  if (restartBtn) restartBtn.addEventListener("click", () => {
    index = 0; score = 0;
    scoreDisplay.textContent = "Score: 0";
    loadPrompt();
  });
  if (backBtn) backBtn.addEventListener("click", () => window.location.href = "classes.html");
  if (homeBtn) homeBtn.addEventListener("click", () => window.location.href = "index.html");
});
