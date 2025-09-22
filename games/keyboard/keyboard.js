// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("keyboard-game");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");
  const homeBtn = document.getElementById("homeBtn");

  // Get topic from query string
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  // Define available games/topics
  const games = {
    letters: {
      title: "Keyboard Letters",
      chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
    },
    numbers: {
      title: "Keyboard Numbers",
      chars: "0123456789".split("")
    }
  };

  // Initialize game
  function initGame(game) {
    container.innerHTML = `
      <h2 class="text-xl font-bold mb-4">${game.title}</h2>
      <p id="prompt" class="text-lg mb-4">Press the highlighted key</p>
      <div id="virtual-keyboard" class="grid grid-cols-10 gap-2 mb-4"></div>
      <div class="flex space-x-4">
        <button id="nextBtn" class="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
        <button id="restartBtn" class="px-4 py-2 bg-yellow-500 text-white rounded">Restart</button>
        <button id="backBtn" class="px-4 py-2 bg-gray-500 text-white rounded">Back</button>
        <button id="homeBtn" class="px-4 py-2 bg-green-600 text-white rounded">Home</button>
      </div>
    `;

    const vk = document.getElementById("virtual-keyboard");
    const prompt = document.getElementById("prompt");
    const nextBtn = document.getElementById("nextBtn");

    let currentIndex = 0;

    // Build virtual keyboard
    game.chars.forEach(char => {
      const keyEl = document.createElement("div");
      keyEl.textContent = char;
      keyEl.className = "key px-3 py-2 border rounded text-center";
      keyEl.id = `key-${char}`;
      vk.appendChild(keyEl);
    });

    // Highlight next character
    function highlightChar() {
      document.querySelectorAll(".key").forEach(el => el.classList.remove("bg-yellow-300"));
      if (currentIndex < game.chars.length) {
        const char = game.chars[currentIndex];
        const keyEl = document.getElementById(`key-${char}`);
        if (keyEl) keyEl.classList.add("bg-yellow-300");
        prompt.textContent = `Press "${char}"`;
      } else {
        prompt.textContent = "🎉 Great job! You finished.";
      }
    }

    // Handle input (both physical + virtual)
    function handleInput(inputChar) {
      if (currentIndex >= game.chars.length) return;

      const expectedChar = game.chars[currentIndex];
      const keyEl = document.getElementById(`key-${expectedChar}`);

      if (inputChar.toUpperCase() === expectedChar) {
        // Correct input
        if (keyEl) {
          keyEl.classList.add("bg-green-400");
          setTimeout(() => {
            keyEl.classList.remove("bg-green-400");
            currentIndex++;
            highlightChar();
          }, 500); // auto-advance
        }
      } else {
        // Wrong input
        const wrongEl = document.getElementById(`key-${inputChar.toUpperCase()}`);
        if (wrongEl) {
          wrongEl.classList.add("bg-red-400");
          setTimeout(() => wrongEl.classList.remove("bg-red-400"), 500);
        }
      }
    }

    // Virtual key clicks
    document.querySelectorAll(".key").forEach(keyEl => {
      keyEl.addEventListener("click", () => handleInput(keyEl.textContent));
    });

    // Physical keyboard
    document.addEventListener("keydown", e => {
      handleInput(e.key.toUpperCase());
    });

    // Next button (manual)
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentIndex++;
        highlightChar();
      });
    }

    highlightChar();
  }

  // Start button logic
  if (startBtn && topic && games[topic]) {
    startBtn.addEventListener("click", () => {
      startBtn.style.display = "none"; // hide start button
      initGame(games[topic]);
    });
  } else if (!games[topic]) {
    container.innerHTML = `<p class="text-red-600">❌ Invalid topic. Please go back and select again.</p>`;
  }

  // Other button handlers
  if (restartBtn) restartBtn.addEventListener("click", () => location.reload());
  if (backBtn) backBtn.addEventListener("click", () => (window.location.href = "classes.html"));
  if (homeBtn) homeBtn.addEventListener("click", () => (window.location.href = "index.html"));

  /*
  // 🚫 Mobile devices restriction (commented out for now)
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    container.innerHTML = "<p class='text-red-600'>❌ Sorry, this game is for desktop devices only.</p>";
    return;
  }
  */
});
