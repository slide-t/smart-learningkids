// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const nextBtn = document.getElementById("nextBtn");
  const homeBtn = document.getElementById("homeBtn");

  const practiceArea = document.getElementById("practiceArea");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const targetChar = document.getElementById("targetChar");
  const feedback = document.getElementById("feedback");

  let content = []; // Loaded from JSON
  let currentIndex = 0;

  // Get topic from query string (keyboard.html?topic=home-row)
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  async function loadTopic() {
    try {
      const response = await fetch("classes.json");
      const data = await response.json();

      if (data[topic] && data[topic].content) {
        content = data[topic].content;
      } else {
        feedback.textContent = "❌ Invalid topic or no content found.";
        return;
      }
    } catch (err) {
      console.error("Error loading classes.json:", err);
      feedback.textContent = "⚠️ Could not load topics.";
    }
  }

  function initGame() {
    currentIndex = 0;
    showNext();
  }

  function showNext() {
    if (currentIndex < content.length) {
      targetChar.textContent = content[currentIndex];
      feedback.textContent = "";
    } else {
      targetChar.textContent = "🎉";
      feedback.textContent = "Well done! You finished this topic.";
      nextBtn.classList.remove("hidden");
    }
  }

  function handleInput(input) {
    const expected = content[currentIndex];
    if (input.toUpperCase() === expected.toUpperCase()) {
      feedback.textContent = "✅ Correct!";
      feedback.className = "text-green-600 text-lg font-semibold";
      currentIndex++;
      setTimeout(showNext, 700);
    } else {
      feedback.textContent = "❌ Try again...";
      feedback.className = "text-red-600 text-lg font-semibold";
    }
  }

  // Handle physical keyboard
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (/^[A-Z;,. ]$/.test(key)) { // allow letters, ; , . and space
      handleInput(key);

      // Highlight virtual key if exists
      const keyEl = virtualKeyboard.querySelector(`[data-key="${key}"]`);
      if (keyEl) {
        highlightKey(keyEl);
      }
    }
  });

  // Handle virtual keyboard clicks
  virtualKeyboard.addEventListener("click", (e) => {
    if (e.target.classList.contains("key")) {
      const key = e.target.getAttribute("data-key");
      handleInput(key);
      highlightKey(e.target);
    }
  });

  function highlightKey(el) {
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 300);
  }

  // Buttons
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      startBtn.classList.add("hidden");
      practiceArea.classList.remove("hidden");
      virtualKeyboard.classList.remove("hidden");

      await loadTopic(); // fetch from JSON
      if (content.length > 0) initGame();
    });
  }

  if (restartBtn) restartBtn.addEventListener("click", () => location.reload());
  if (homeBtn) homeBtn.addEventListener("click", () => window.location.href = "index.html");
  if (nextBtn) nextBtn.addEventListener("click", () => {
    alert("👉 Load the next topic (you can extend this using order in classes.json)");
  });
});
