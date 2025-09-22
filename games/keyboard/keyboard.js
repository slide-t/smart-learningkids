document.addEventListener("DOMContentLoaded", () => {
  const practiceArea = document.getElementById("practiceArea");
  const targetCharEl = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");

  let stages = [];
  let stageIndex = 0;
  let currentStage = null;
  let target = "";
  let targetPos = 0;
  let score = 0;

  // Detect which layout row to use
  const layouts = {
    letters: [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L",";"],
      ["Z","X","C","V","B","N","M",",",".","/"]
    ],
    numbers: [["1","2","3","4","5","6","7","8","9","0"]],
    symbols: [["-","+","=","'","\"","!","?","@","#","$"]]
  };

  function getLayoutForKey(char) {
    if (/^[a-zA-Z;,\./]$/.test(char)) return layouts.letters;
    if (/^[0-9]$/.test(char)) return layouts.numbers;
    return layouts.symbols;
  }

  // Render virtual keyboard dynamically
  function renderKeyboard(char) {
    const layout = getLayoutForKey(char);
    virtualKeyboard.innerHTML = "";
    layout.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "flex justify-center gap-1 mb-1";
      row.forEach(key => {
        const btn = document.createElement("div");
        btn.className = "key disabled";
        btn.textContent = key;
        btn.dataset.key = key;
        btn.addEventListener("click", () => handleInput(key));
        rowDiv.appendChild(btn);
      });
      virtualKeyboard.appendChild(rowDiv);
    });
  }

  // Highlight target key
  function highlightKey(char) {
    document.querySelectorAll(".key").forEach(k => {
      k.classList.remove("active");
      k.classList.add("disabled");
    });
    const keyBtn = Array.from(document.querySelectorAll(".key"))
      .find(k => k.dataset.key.toUpperCase() === char.toUpperCase());
    if (keyBtn) {
      keyBtn.classList.remove("disabled");
      keyBtn.classList.add("active");
    }
  }

  // Load keyboard.json for the selected year/topic
  function loadKeyboardData(year) {
    fetch("keyboard.json")
      .then(res => res.json())
      .then(data => {
        if (!data.levels[year]) {
          feedbackEl.textContent = "⚠️ This year/topic is not available.";
          return;
        }
        stages = data.levels[year].stages.map(s => ({
          name: s.title,
          type: s.type,
          keys: s.items
        }));
        stageIndex = 0;
        currentStage = stages[stageIndex];
        feedbackEl.textContent = `➡️ Stage: ${currentStage.name}`;
      })
      .catch(err => {
        console.error(err);
        feedbackEl.textContent = "❌ Failed to load keyboard data.";
      });
  }

  function nextTarget() {
    if (!currentStage.keys.length) return;
    const randomIndex = Math.floor(Math.random() * currentStage.keys.length);
    target = currentStage.keys[randomIndex];
    targetPos = 0;
    targetCharEl.textContent = target;
    feedbackEl.textContent = "";
    renderKeyboard(target[0]);
    highlightKey(target[0]);
  }

  function handleInput(input) {
    if (!target) return;
    let expected = target[targetPos];
    if (expected === " ") expected = "SPACE";

    if (input.toUpperCase() === expected.toUpperCase()) {
      targetPos++;
      if (targetPos < target.length) {
        targetCharEl.textContent = target[targetPos];
        renderKeyboard(target[targetPos]);
        highlightKey(target[targetPos]);
      } else {
        score += 10;
        feedbackEl.textContent = `✅ Correct! Score: ${score}`;
        nextTarget();
      }
    } else {
      feedbackEl.textContent = `❌ Wrong! Try again`;
    }
  }

  function nextStage() {
    stageIndex++;
    if (stageIndex >= stages.length) {
      feedbackEl.textContent = `🎉 All stages complete! Final Score: ${score}`;
      practiceArea.classList.add("hidden");
      virtualKeyboard.classList.add("hidden");
      return;
    }
    currentStage = stages[stageIndex];
    feedbackEl.textContent = `➡️ Stage: ${currentStage.name}`;
    nextTarget();
  }

  // Buttons
  startBtn.addEventListener("click", () => {
    practiceArea.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    virtualKeyboard.classList.remove("hidden");
    nextTarget();
  });

  nextBtn.addEventListener("click", nextStage);

  restartBtn.addEventListener("click", () => {
    stageIndex = 0;
    score = 0;
    currentStage = stages[0];
    feedbackEl.textContent = "";
    practiceArea.classList.add("hidden");
    virtualKeyboard.classList.add("hidden");
  });

  homeBtn.addEventListener("click", () => window.location.href = "index.html");

  // Physical keyboard input
  document.addEventListener("keydown", e => {
    if (e.key.length === 1) handleInput(e.key);
    else if (e.key === " ") handleInput("SPACE");
    else if (e.key === ";") handleInput(";");
  });

  // Auto-load keyboard.json based on query param "year"
  const params = new URLSearchParams(window.location.search);
  const year = params.get("year") || "1";
  loadKeyboardData(year);
});
