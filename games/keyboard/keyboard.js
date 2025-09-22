document.addEventListener("DOMContentLoaded", () => {
  const practiceArea = document.getElementById("practiceArea");
  const targetCharEl = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");

  // Get the year from query string, e.g., keyboard.html?year=1
  const urlParams = new URLSearchParams(window.location.search);
  const selectedYear = urlParams.get("year") || "1"; // default to Year 1

  // Full keyboard layout
  const layouts = {
    letters: [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L",";"],
      ["Z","X","C","V","B","N","M",",",".","/"]
    ],
    numbers: [["1","2","3","4","5","6","7","8","9","0"]],
    symbols: [["-","+","=","'","\"","!","?","@","#","$"]]
  };

  let stages = []; // will be populated dynamically
  let stageIndex = 0;
  let currentStage = null;
  let target = "";
  let score = 0;

  // Fetch keyboard.json and load the stages for the selected year
  fetch("keyboard.json")
    .then(res => res.json())
    .then(data => {
      if (data.levels && data.levels[selectedYear]) {
        stages = data.levels[selectedYear].stages.map(s => ({
          name: s.title,
          type: s.type,
          keys: s.items
        }));
        currentStage = stages[stageIndex];
      } else {
        feedbackEl.textContent = "❌ No stages found for this year.";
      }
    })
    .catch(err => {
      console.error(err);
      feedbackEl.textContent = "❌ Failed to load keyboard data.";
    });

  // Determine layout based on character type
  function getLayoutForKey(char) {
    if (/^[a-zA-Z;,\./]$/.test(char)) return layouts.letters;
    if (/^[0-9]$/.test(char)) return layouts.numbers;
    return layouts.symbols;
  }

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

  function nextTarget() {
    if (!currentStage || !currentStage.keys.length) return;
    const randomIndex = Math.floor(Math.random() * currentStage.keys.length);
    target = currentStage.keys[randomIndex];
    targetCharEl.textContent = target;
    feedbackEl.textContent = "";

    // Highlight only the first character for words/sentences
    renderKeyboard(target);
    highlightKey(target[0]);
  }

  function handleInput(input) {
    if (!target) return;

    let expected = target[0];
    if (target.length === 1) expected = target;

    if (input.toUpperCase() === expected.toUpperCase()) {
      score += 10;
      feedbackEl.textContent = `✅ Correct! Score: ${score}`;
      nextTarget();
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

  startBtn.addEventListener("click", () => {
    if (!stages.length) return; // wait until stages loaded
    practiceArea.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    virtualKeyboard.classList.remove("hidden");
    feedbackEl.textContent = `➡️ Stage: ${currentStage.name}`;
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

  document.addEventListener("keydown", e => {
    if (e.key.length === 1) handleInput(e.key);
    else if (e.key === " ") handleInput("SPACE");
    else if (e.key === ";") handleInput(";");
  });
});
