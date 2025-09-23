// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const startKeyboardBtn = document.getElementById("keyboardMode");
  const startMouseBtn = document.getElementById("mouseMode");
  const practiceArea = document.getElementById("practiceArea");
  const targetChar = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const mouseBoard = document.getElementById("mouseBoard");

  let classesData = [];
  let topics = [];
  let currentTopicIndex = 0;
  let currentChars = [];
  let currentCharIndex = 0;
  let mode = ""; // "keyboard" or "mouse"

  // --- Load classes.json ---
  async function loadClasses() {
    try {
      const res = await fetch("classes.json");
      classesData = await res.json();

      // flatten topics across all terms/stages
      topics = classesData.flatMap(cls =>
        cls.terms.flatMap(term =>
          term.topics.map(t => t.link)
        )
      );
    } catch (err) {
      console.error("Error loading classes.json:", err);
    }
  }

  // --- Load one topic (keyboard.json) ---
  async function loadTopic(topicFile) {
    try {
      const res = await fetch(topicFile);
      const topicData = await res.json();

      if (topicData && topicData.content) {
        currentChars = topicData.content;
        currentTopicIndex = topics.indexOf(topicFile);
        currentCharIndex = 0;

        if (mode === "keyboard") {
          loadKeyboardItem();
        } else if (mode === "mouse") {
          loadMouseItem();
        }
      }
    } catch (err) {
      console.error("Error loading topic:", err);
    }
  }

  // =========================
  // KEYBOARD MODE
  // =========================
  function loadKeyboardItem() {
    if (currentCharIndex < currentChars.length) {
      const char = currentChars[currentCharIndex];
      targetChar.textContent = char.toUpperCase();
      feedbackEl.textContent = "";
      highlightKey(char);
    } else {
      nextTopic();
    }
  }

  function checkKeyboardInput(input) {
    const expected = currentChars[currentCharIndex];
    if (!expected) return;

    if (input.toLowerCase() === expected.toLowerCase()) {
      feedbackEl.textContent = "✅ Correct!";
      feedbackEl.className = "text-green-600 font-semibold";
      currentCharIndex++;
      setTimeout(loadKeyboardItem, 500);
    } else {
      feedbackEl.textContent = `❌ Try again!`;
      feedbackEl.className = "text-red-600 font-semibold";
    }
  }

  function highlightKey(char) {
    document.querySelectorAll(".key").forEach(el => el.classList.remove("highlight"));
    const btn = document.querySelector(`.key[data-key="${char.toUpperCase()}"]`);
    if (btn) btn.classList.add("highlight");
  }

  // =========================
  // MOUSE MODE
  // =========================
  function loadMouseItem() {
    mouseBoard.innerHTML = "";
    if (currentCharIndex < currentChars.length) {
      const word = currentChars[currentCharIndex];
      targetChar.textContent = word.toUpperCase();
      feedbackEl.textContent = "";

      const letters = word.split("");
      const shuffled = [...letters].sort(() => Math.random() - 0.5);

      shuffled.forEach(letter => {
        const btn = document.createElement("button");
        btn.textContent = letter.toUpperCase();
        btn.className =
          "px-4 py-2 bg-purple-300 rounded-lg m-2 text-xl font-bold hover:bg-purple-400";
        btn.addEventListener("click", () => handleMouseClick(letter, word));
        mouseBoard.appendChild(btn);
      });

      mouseBoard.dataset.word = word;
      mouseBoard.dataset.progress = "";
    } else {
      nextTopic();
    }
  }

  function handleMouseClick(letter, word) {
    let progress = mouseBoard.dataset.progress;
    const expected = word[progress.length];

    if (letter === expected) {
      mouseBoard.dataset.progress += letter;
      if (mouseBoard.dataset.progress === word) {
        feedbackEl.textContent = "✅ Correct!";
        feedbackEl.className = "text-green-600 font-semibold";
        currentCharIndex++;
        setTimeout(loadMouseItem, 700);
      }
    } else {
      feedbackEl.textContent = "❌ Wrong letter!";
      feedbackEl.className = "text-red-600 font-semibold";
    }
  }

  // =========================
  // TOPIC PROGRESSION
  // =========================
  function nextTopic() {
    currentTopicIndex++;
    if (currentTopicIndex < topics.length) {
      loadTopic(topics[currentTopicIndex]);
    } else {
      targetChar.textContent = "";
      feedbackEl.textContent = "🎉 All topics complete!";
      feedbackEl.className = "text-green-600 font-bold";
    }
  }

  // =========================
  // EVENT LISTENERS
  // =========================
  startKeyboardBtn.addEventListener("click", async () => {
    await loadClasses();
    mode = "keyboard";
    practiceArea.classList.remove("hidden");
    virtualKeyboard.classList.remove("hidden");
    mouseBoard.classList.add("hidden");
    currentTopicIndex = 0;
    loadTopic(topics[currentTopicIndex]);
  });

  startMouseBtn.addEventListener("click", async () => {
    await loadClasses();
    mode = "mouse";
    practiceArea.classList.remove("hidden");
    virtualKeyboard.classList.add("hidden");
    mouseBoard.classList.remove("hidden");
    currentTopicIndex = 0;
    loadTopic(topics[currentTopicIndex]);
  });

  // Virtual keyboard clicks
  virtualKeyboard.addEventListener("click", (e) => {
    if (mode === "keyboard" && e.target.classList.contains("key")) {
      const key = e.target.dataset.key;
      checkKeyboardInput(key);
    }
  });

  // Real keyboard
  document.addEventListener("keydown", (e) => {
    if (mode === "keyboard") {
      const key = e.key.toUpperCase();
      checkKeyboardInput(key);
    }
  });
});
