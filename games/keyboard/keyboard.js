// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  // ==============================
  // MODE 1: Typing words/sentences
  // ==============================
  const container = document.getElementById("keyboard-game");

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
    // ... add more topics here
  };

  function initTypingGame(game) {
    if (!container) return;

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

  // ==============================
  // MODE 2: Virtual Keyboard (A–Z)
  // ==============================
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const nextBtn = document.getElementById("nextBtn");
  const homeBtn = document.getElementById("homeBtn");

  const practiceArea = document.getElementById("practiceArea");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const targetChar = document.getElementById("targetChar");
  const feedback = document.getElementById("feedback");

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let currentIndex = 0;

  function pickChar() {
    if (!targetChar) return;
    if (currentIndex < chars.length) {
      targetChar.textContent = chars[currentIndex];
      feedback.textContent = "";

      // highlight next key
      document.querySelectorAll(".key").forEach(k => k.classList.remove("active"));
      const keyDiv = document.querySelector(`.key[data-key="${chars[currentIndex]}"]`);
      if (keyDiv) keyDiv.classList.add("active");
    } else {
      feedback.textContent = "✅ Great job! You finished all rounds.";
      nextBtn.classList.add("hidden");
      restartBtn.classList.remove("hidden");
    }
  }

  function initPracticeGame() {
    currentIndex = 0;
    pickChar();
    document.addEventListener("keydown", handleKeyPress);
  }

  function handleKeyPress(e) {
    const expected = chars[currentIndex];
    if (!expected) return;

    const pressedKey = e.key.toUpperCase();
    const keyDiv = document.querySelector(`.key[data-key="${pressedKey}"]`);

    if (pressedKey === expected) {
      feedback.textContent = "✅ Correct!";
      feedback.className = "text-green-600 font-bold";

      // flash green
      if (keyDiv) {
        keyDiv.classList.add("correct");
        setTimeout(() => keyDiv.classList.remove("correct"), 300);
      }

      nextBtn.classList.remove("hidden"); // show Next button
    } else {
      feedback.textContent = "❌ Try again!";
      feedback.className = "text-red-600 font-bold";

      // flash red
      if (keyDiv) {
        keyDiv.classList.add("wrong");
        setTimeout(() => keyDiv.classList.remove("wrong"), 300);
      }
    }
  }

  // ==============================
  // BUTTONS
  // ==============================
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("hidden");
      practiceArea.classList.remove("hidden");
      virtualKeyboard.classList.remove("hidden");
      initPracticeGame();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentIndex++;
      pickChar();
      nextBtn.classList.add("hidden");
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => location.reload());
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // ==============================
  // DECIDE WHICH MODE TO RUN
  // ==============================
  if (topic && games[topic]) {
    initTypingGame(games[topic]);
  } else {
    // Default to virtual keyboard mode (no error)
    console.log("No valid topic provided, waiting for Start button.");
  }

  // ==============================
  // OPTIONAL: Block mobile users
  // ==============================
  /*
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    alert("❌ This game works best on desktop with a physical keyboard.");
    window.location.href = "index.html";
  }
  */
});
