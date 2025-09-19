
// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const jsonPath = "./keyboard.json";

  // UI elements
  const classSelect = document.getElementById("studentClass");
  const saveProfileBtn = document.getElementById("saveProfile");
  const clearProfileBtn = document.getElementById("clearProfile");
  const profileSaved = document.getElementById("profileSaved");

  const timerEl = document.getElementById("timer");
  const correctEl = document.getElementById("correct");
  const wrongEl = document.getElementById("wrong");
  const accuracyEl = document.getElementById("accuracy");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  const stageTitle = document.getElementById("stageTitle");
  const stageProgress = document.getElementById("stageProgress");
  const board = document.getElementById("game-board");
  const fallingItem = document.getElementById("falling-item");
  const typingInput = document.getElementById("typingInput");
  const feedback = document.getElementById("feedback");
  const endSummary = document.getElementById("endSummary");

  let data = null;
  let currentLevel = null;
  let stages = [];
  let stageIndex = 0;
  let items = [];
  let itemIndex = 0;

  let correct = 0;
  let wrong = 0;
  let total = 0;
  let timer = null;
  let timeLeft = 0;
  let paused = false;

  // Load profile if saved
  function loadProfile() {
    const saved = JSON.parse(localStorage.getItem("keyboardProfile") || "{}");
    if (saved.name) document.getElementById("studentName").value = saved.name;
    if (saved.class) classSelect.value = saved.class;
    if (saved.class) loadLevel(saved.class);
  }

  // Save profile
  saveProfileBtn.addEventListener("click", () => {
    const profile = {
      name: document.getElementById("studentName").value.trim(),
      class: classSelect.value
    };
    localStorage.setItem("keyboardProfile", JSON.stringify(profile));
    profileSaved.textContent = "Profile saved!";
    setTimeout(() => (profileSaved.textContent = ""), 1500);
    if (profile.class) loadLevel(profile.class);
  });

  // Clear profile
  clearProfileBtn.addEventListener("click", () => {
    localStorage.removeItem("keyboardProfile");
    document.getElementById("studentName").value = "";
    classSelect.value = "";
    profileSaved.textContent = "Profile cleared";
    setTimeout(() => (profileSaved.textContent = ""), 1500);
    currentLevel = null;
    stages = [];
  });

  // Load JSON
  fetch(jsonPath)
    .then(res => res.json())
    .then(json => {
      data = json;
      populateClassSelect();
      loadProfile();
    })
    .catch(err => {
      console.error("Error loading keyboard.json:", err);
      stageTitle.textContent = "⚠️ Failed to load game data.";
    });

  // Populate Year 1–12 in dropdown
  function populateClassSelect() {
    Object.keys(data.levels).forEach(level => {
      const opt = document.createElement("option");
      opt.value = level;
      opt.textContent = data.levels[level].label;
      classSelect.appendChild(opt);
    });
  }

  // Load a level
  function loadLevel(levelId) {
    currentLevel = data.levels[levelId];
    if (!currentLevel) return;

    stages = currentLevel.stages;
    stageIndex = 0;
    timeLeft = currentLevel.timeLimit;

    updateTimer();
    updateStageInfo();
  }

  // Start session
  startBtn.addEventListener("click", () => {
    if (!currentLevel) {
      feedback.textContent = "⚠️ Select your class first!";
      return;
    }
    resetStats();
    nextStage();
    startTimer();
    feedback.textContent = "Session started!";
  });

  // Pause
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    if (paused) {
      stopTimer();
      feedback.textContent = "Paused";
    } else {
      startTimer();
      feedback.textContent = "Resumed";
    }
  });

  // Reset
  resetBtn.addEventListener("click", resetSession);

  // -----------------------
  // Gameplay
  // -----------------------

  function nextStage() {
    if (stageIndex >= stages.length) {
      endSession();
      return;
    }

    const stage = stages[stageIndex];
    items = stage.items;
    itemIndex = 0;

    stageTitle.textContent = stage.title;
    stageProgress.textContent = `Stage ${stageIndex + 1} / ${stages.length}`;

    nextItem();
  }

  function nextItem() {
    if (itemIndex >= items.length) {
      stageIndex++;
      nextStage();
      return;
    }

    const stage = stages[stageIndex];
    const item = items[itemIndex];

    if (stage.type === "key" || stage.type === "emoji") {
      typingInput.classList.add("hidden");
      fallingItem.textContent = item;
      fallingItem.classList.add("drop-enter");
      setTimeout(() => fallingItem.classList.remove("drop-enter"), 500);

      // Wait for correct key press
      const handler = e => {
        if (paused) return;
        if (e.key === item) {
          markCorrect();
          window.removeEventListener("keydown", handler);
          itemIndex++;
          nextItem();
        } else {
          markWrong();
          fallingItem.classList.add("shake");
          setTimeout(() => fallingItem.classList.remove("shake"), 400);
        }
      };
      window.addEventListener("keydown", handler);
    } else {
      // word / sentence / paragraph / code
      typingInput.value = "";
      typingInput.classList.remove("hidden");
      typingInput.focus();
      fallingItem.textContent = item;

      const handler = e => {
        if (paused) return;
        if (e.key === "Enter") {
          if (typingInput.value.trim() === item) {
            markCorrect();
          } else {
            markWrong();
          }
          typingInput.value = "";
          itemIndex++;
          typingInput.removeEventListener("keydown", handler);
          nextItem();
        }
      };
      typingInput.addEventListener("keydown", handler);
    }
  }

  function markCorrect() {
    correct++;
    total++;
    correctEl.textContent = correct;
    updateAccuracy();
    feedback.textContent = "✅ Correct!";
  }

  function markWrong() {
    wrong++;
    total++;
    wrongEl.textContent = wrong;
    updateAccuracy();
    feedback.textContent = "❌ Try again";
  }

  function updateAccuracy() {
    const acc = total ? Math.round((correct / total) * 100) : 0;
    accuracyEl.textContent = `${acc}%`;
  }

  // -----------------------
  // Timer
  // -----------------------
  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (!paused) {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
          endSession();
        }
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  function updateTimer() {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    timerEl.textContent = `${min}:${sec}`;
  }

  // -----------------------
  // Reset & End
  // -----------------------
  function resetStats() {
    correct = 0;
    wrong = 0;
    total = 0;
    correctEl.textContent = 0;
    wrongEl.textContent = 0;
    accuracyEl.textContent = "0%";
    endSummary.classList.add("hidden");
  }

  function resetSession() {
    stopTimer();
    resetStats();
    timeLeft = currentLevel ? currentLevel.timeLimit : 0;
    updateTimer();
    stageIndex = 0;
    itemIndex = 0;
    feedback.textContent = "Session reset";
    stageTitle.textContent = "Ready";
    stageProgress.textContent = "Stage 0 / 0";
    fallingItem.textContent = "";
    typingInput.classList.add("hidden");
  }

  function endSession() {
    stopTimer();
    typingInput.classList.add("hidden");
    fallingItem.textContent = "";
    feedback.textContent = "✅ Session complete!";

    endSummary.classList.remove("hidden");
    endSummary.innerHTML = `
      <h3 class="font-semibold mb-2">Session Summary</h3>
      <p>Total Attempts: ${total}</p>
      <p>Correct: ${correct}</p>
      <p>Wrong: ${wrong}</p>
      <p>Accuracy: ${accuracyEl.textContent}</p>
    `;
  }
});
