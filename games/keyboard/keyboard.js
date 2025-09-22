// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");
  const practiceArea = document.getElementById("practiceArea");
  const targetChar = document.getElementById("targetChar");
  const feedback = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const keys = document.querySelectorAll(".key");

  // Game content (replace or expand with your classes.json topics)
  const games = {
    "home-row": ["A","S","D","F","J","K","L",";"],
    "short-sentences": ["I","am","happy",".","We","play","ball","."],
    "two-letter": ["at","on","in","up","to","it"]
  };

  // Get topic from URL
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic") || "home-row";
  let gameContent = games[topic];
  if (!gameContent) gameContent = games["home-row"];

  let index = 0;
  let score = 0;

  function highlightKey(key) {
    keys.forEach(k => k.classList.remove("active"));
    const kEl = [...keys].find(k => k.dataset.key.toUpperCase() === key.toUpperCase());
    if (kEl) kEl.classList.add("active");
  }

  function loadNext() {
    if (index >= gameContent.length) {
      targetChar.textContent = "🎉 Finished!";
      feedback.textContent = `Final Score: ${score}`;
      practiceArea.classList.add("hidden");
      startBtn.classList.remove("hidden");
      nextBtn.classList.add("hidden");
      return;
    }
    targetChar.textContent = gameContent[index];
    feedback.textContent = "";
    highlightKey(gameContent[index]);
  }

  startBtn.addEventListener("click", () => {
    index = 0; score = 0;
    practiceArea.classList.remove("hidden");
    virtualKeyboard.classList.remove("hidden");
    startBtn.classList.add("hidden");
    restartBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
    loadNext();
  });

  nextBtn.addEventListener("click", () => {
    index++;
    loadNext();
    nextBtn.classList.add("hidden");
  });

  restartBtn.addEventListener("click", () => {
    index = 0; score = 0;
    loadNext();
    feedback.textContent = "";
  });

  homeBtn.addEventListener("click", () => window.location.href = "index.html");

  // Physical keyboard input
  document.addEventListener("keydown", (e) => {
    if (practiceArea.classList.contains("hidden")) return;
    const expected = gameContent[index].toUpperCase();
    const pressed = e.key.toUpperCase();
    if (pressed === expected) {
      feedback.textContent = "✅ Correct!";
      score += 10;
      index++;
      setTimeout(loadNext, 500);
    } else {
      feedback.textContent = "⏳ Try again...";
    }
  });

  // Virtual keyboard click
  keys.forEach(k => {
    k.addEventListener("click", () => {
      if (practiceArea.classList.contains("hidden")) return;
      const expected = gameContent[index].toUpperCase();
      const clicked = k.dataset.key.toUpperCase();
      if (clicked === expected) {
        feedback.textContent = "✅ Correct!";
        score += 10;
        index++;
        setTimeout(loadNext, 500);
      } else {
        feedback.textContent = "⏳ Try again...";
      }
    });
  });
});
