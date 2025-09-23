// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");
  const practiceArea = document.getElementById("practiceArea");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const targetChar = document.getElementById("targetChar");
  const feedback = document.getElementById("feedback");

  let classesData = [];
  let topics = [];
  let currentTopicIndex = 0;
  let currentChars = [];
  let currentCharIndex = 0;

  // Load classes.json on page load
  async function loadClasses() {
    try {
      const res = await fetch("classes.json");
      classesData = await res.json();

      // Flatten topics across terms
      topics = classesData.flatMap(cls =>
        cls.terms.flatMap(term =>
          term.topics.map(t => t.link)
        )
      );
    } catch (err) {
      console.error("Error loading classes.json:", err);
    }
  }

  // Load one topic's keyboard.json
  async function loadTopic(topicFile) {
    try {
      const res = await fetch(topicFile);
      const topicData = await res.json();

      if (topicData && topicData.content) {
        // join arrays → flatten → split into characters
        currentChars = topicData.content.join(" ").split("");
        currentCharIndex = 0;
        showChar();
      }
    } catch (err) {
      console.error("Error loading topic:", err);
    }
  }

  function showChar() {
    if (currentCharIndex < currentChars.length) {
      const char = currentChars[currentCharIndex];
      targetChar.textContent = char;
      feedback.textContent = "";

      // highlight the target key on virtual keyboard
      clearHighlights();
      const keyEl = document.querySelector(`.key[data-key="${char.toUpperCase()}"]`);
      if (keyEl) keyEl.classList.add("highlight");
    } else {
      // completed one topic → load next
      currentTopicIndex++;
      if (currentTopicIndex < topics.length) {
        loadTopic(topics[currentTopicIndex]);
      } else {
        // finished all topics
        targetChar.textContent = "";
        feedback.textContent = "🎉 Great job! You finished all topics.";
        feedback.className = "text-green-600 font-semibold";
        clearHighlights();
        currentTopicIndex = 0; // reset if you want to loop
      }
    }
  }

  function showNextChar() {
    currentCharIndex++;
    showChar();
  }

  function checkInput(key) {
    const expected = currentChars[currentCharIndex];

    if (!expected) return;

    if (key.toLowerCase() === expected.toLowerCase()) {
      feedback.textContent = "✅ Correct!";
      feedback.className = "text-green-600 font-semibold";

      // advance automatically
      setTimeout(showNextChar, 400);
    } else {
      feedback.textContent = `⏳ Try again... (${expected})`;
      feedback.className = "text-blue-600 font-semibold";
    }
  }

  function clearHighlights() {
    document.querySelectorAll(".key").forEach(el => el.classList.remove("highlight"));
  }

  // Virtual keyboard click
  if (virtualKeyboard) {
    virtualKeyboard.addEventListener("click", (e) => {
      if (e.target.classList.contains("key")) {
        const key = e.target.dataset.key;
        checkInput(key);
      }
    });
  }

  // Real keyboard input
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    const keyEl = document.querySelector(`.key[data-key="${key}"]`);
    if (keyEl) {
      checkInput(key);
    }
  });

  // Buttons
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      await loadClasses();
      if (topics.length > 0) {
        practiceArea.classList.remove("hidden");
        virtualKeyboard.classList.remove("hidden");
        startBtn.classList.add("hidden");
        restartBtn.classList.remove("hidden");
        currentTopicIndex = 0;
        await loadTopic(topics[currentTopicIndex]);
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      currentCharIndex = 0;
      showChar();
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
