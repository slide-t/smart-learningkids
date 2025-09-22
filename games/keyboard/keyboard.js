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

  // Get selected year from URL query (e.g., keyboard.html?year=1)
  const urlParams = new URLSearchParams(window.location.search);
  const selectedYear = urlParams.get("year") || "1";

  // Load keyboard.json
  fetch("keyboard.json")
    .then(res => res.json())
    .then(data => {
      const level = data.levels[selectedYear];
      if (!level) {
        feedbackEl.textContent = "⚠️ Selected year not found in keyboard.json";
        return;
      }
      stages = level.stages;
      currentStage = stages[stageIndex];
      feedbackEl.textContent = `➡️ Stage: ${currentStage.title}`;
    })
    .catch(err => {
      console.error(err);
      feedbackEl.textContent = "⚠️ Failed to load keyboard.json";
    });

  function getLayoutForChar(char) {
    if (/^[a-zA-Z;,\./]$/.test(char)) return [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L",";"],
      ["Z","X","C","V","B","N","M",",",".","/"]
    ];
    if (/^[0-9]$/.test(char)) return [["1","2","3","4","5","6","7","8","9","0"]];
    return [["-","+","=","'","\"","!","?","@","#","$"]];
  }

  function renderKeyboard(char) {
    const layout = getLayoutForChar(char);
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
    if (!currentStage.items || currentStage.items.length === 0) return;

    const randomIndex = Math.floor(Math.random() * currentStage.items.length);
    target = currentStage.items[randomIndex];
    targetPos = 0;

    targetCharEl.textContent = target[targetPos];
    feedbackEl.textContent = "";
    renderKeyboard(target[targetPos]);
    highlightKey(target[targetPos]);
  }

  function handleInput(input) {
    if (!target) return;

    let expected = target[targetPos];
    if (expected === " ") expected = " "; // spaces

    if (input.toUpperCase() === expected.toUpperCase() || (expected === " " && input === "SPACE")) {
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
    feedbackEl.textContent = `➡️ Stage: ${currentStage.title}`;
    nextTarget();
  }

  // Buttons
  startBtn.addEventListener("click", () => {
    if (!stages.length) return;
    practiceArea.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    virtualKeyboard.classList.remove("hidden");
    feedbackEl.textContent = `➡️ Stage: ${currentStage.title}`;
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
});
