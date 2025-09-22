document.addEventListener("DOMContentLoaded", () => {
  const practiceArea = document.getElementById("practiceArea");
  const targetCharEl = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");

  // Full keyboard layout including common symbols
  const keyLayout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L",";"],
    ["Z","X","C","V","B","N","M",",",".","/"],
    ["1","2","3","4","5","6","7","8","9","0"],
    ["-","+","=","'","\"","!","?","@","#","$"]
  ];

  // Progressive stages
  const stages = [
    { name: "Home Row", keys: ["A","S","D","F","J","K","L",";"] },
    { name: "Top Row", keys: ["Q","W","E","R","T","Y","U","I","O","P"] },
    { name: "Bottom Row", keys: ["Z","X","C","V","B","N","M",",",".","/"] },
    { name: "Numbers", keys: ["1","2","3","4","5","6","7","8","9","0"] },
    { name: "Symbols", keys: ["-","+","=","'","\"","!","?","@","#","$"] },
    { name: "Words Practice", keys: ["cat","dog","sun","pen","book","water"] },
    { name: "Sentences Practice", keys: ["I am happy.","We play ball.","The cat runs."] }
  ];

  let stageIndex = 0;
  let currentStage = stages[stageIndex];
  let target = "";
  let score = 0;

  // Render virtual keyboard
  function renderKeyboard() {
    virtualKeyboard.innerHTML = "";
    keyLayout.forEach(row => {
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

  // Enable only the next key
  function highlightKey(char) {
    document.querySelectorAll(".key").forEach(k => {
      k.classList.remove("active");
      k.classList.add("disabled");
    });

    if (!char) return;
    const keyBtn = Array.from(document.querySelectorAll(".key"))
      .find(k => k.dataset.key.toUpperCase() === char.toUpperCase());
    if (keyBtn) {
      keyBtn.classList.remove("disabled");
      keyBtn.classList.add("active");
    }
  }

  // Pick next target
  function nextTarget() {
    if (!currentStage.keys.length) return;
    const randomIndex = Math.floor(Math.random() * currentStage.keys.length);
    target = currentStage.keys[randomIndex];
    targetCharEl.textContent = target;
    feedbackEl.textContent = "";
    highlightKey(target);
  }

  // Handle input
  function handleInput(input) {
    if (!target) return;
    if (input.toUpperCase() === target.toUpperCase()) {
      score += 10;
      feedbackEl.textContent = `✅ Correct! Score: ${score}`;
      nextTarget();
    } else {
      feedbackEl.textContent = `❌ Wrong! Try again`;
    }
  }

  // Stage control
  function nextStage() {
    stageIndex++;
    if (stageIndex >= stages.length) {
      feedbackEl.textContent = `🎉 All stages complete! Final Score: ${score}`;
      practiceArea.classList.add("hidden");
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
    renderKeyboard();
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

  // Keyboard input support
  document.addEventListener("keydown", e => {
    if (e.key.length === 1) handleInput(e.key.toUpperCase());
    else if (e.key === " ") handleInput("SPACE");
    else if (e.key === ";") handleInput(";");
  });
});
