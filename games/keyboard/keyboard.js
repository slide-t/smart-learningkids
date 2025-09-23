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

  let classesData = [];
  let topics = [];
  let currentTopicIndex = 0;
  let currentChars = [];
  let currentIndex = 0;

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
        currentChars = topicData.content.join("").split(""); // flatten to characters
        currentIndex = 0;
        showChar();
      }
    } catch (err) {
      console.error("Error loading topic:", err);
    }
  }

  function showChar() {
    if (currentIndex < currentChars.length) {
      targetChar.textContent = currentChars[currentIndex];
      feedback.textContent = "";
    } else {
      feedback.textContent = "🎉 Well done! Completed.";
      feedback.className = "text-green-600 font-semibold";
      nextBtn.classList.remove("hidden"); // show Next
    }
  }

  function checkInput(key) {
    if (key.toLowerCase() === currentChars[currentIndex]?.toLowerCase()) {
      feedback.textContent = "✅ Correct!";
      feedback.className = "text-green-600 font-semibold";
      currentIndex++;
      setTimeout(showChar, 500);
    } else {
      feedback.textContent = "⏳ Try again...";
      feedback.className = "text-blue-600 font-semibold";
    }
  }

  // Virtual keyboard click
  if (virtualKeyboard) {
    virtualKeyboard.addEventListener("click", (e) => {
      if (e.target.classList.contains("key")) {
        const key = e.target.dataset.key;
        highlightKey(e.target);
        checkInput(key);
      }
    });
  }

  // Real keyboard input
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    const keyEl = document.querySelector(`.key[data-key="${key}"]`);
    if (keyEl) {
      highlightKey(keyEl);
      checkInput(key);
    }
  });

  function highlightKey(el) {
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 200);
  }

  // Buttons
  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      await loadClasses();
      if (topics.length > 0) {
        practiceArea.classList.remove("hidden");
        virtualKeyboard.classList.remove("hidden");
        startBtn.classList.add("hidden");
        restartBtn.classList.remove("hidden");
        nextBtn.classList.add("hidden");
        currentTopicIndex = 0;
        await loadTopic(topics[currentTopicIndex]);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", async () => {
      currentTopicIndex++;
      if (currentTopicIndex >= topics.length) {
        currentTopicIndex = 0; // loop back
      }
      nextBtn.classList.add("hidden");
      await loadTopic(topics[currentTopicIndex]);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      currentIndex = 0;
      showChar();
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
