document.addEventListener("DOMContentLoaded", () => {
  const practiceArea = document.getElementById("practiceArea");
  const targetCharEl = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");

  // Full keyboard layout with dynamic rows
  const layouts = {
    letters: [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L",";"],
      ["Z","X","C","V","B","N","M",",",".","/"]
    ],
    numbers: [["1","2","3","4","5","6","7","8","9","0"]],
    symbols: [["-","+","=","'","\"","!","?","@","#","$"]]
  };

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

  // Determine which layout to show
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

  // Highlight only the target key
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

  // Pick next target key or word
  function nextTarget() {
    if (!currentStage.keys.length) return;
    const randomIndex = Math.floor(Math.random() * currentStage.keys.length);
    target = currentStage.keys[randomIndex];
    targetCharEl.textContent = target;
    feedbackEl.textContent = "";
    renderKeyboard(target);
    highlightKey(target[0]); // only first char highlighted for words
  }

  // Handle user input
  function handleInput(input) {
    if (!target) return;

    let expected = target[0]; // first char
    if (target.length === 1) expected = target; // single keys

    if (input.toUpperCase() === expected.toUpperCase()) {
      score += 10;
      feedbackEl.textContent = `✅ Correct! Score: ${score}`;
      nextTarget();
    } else {
      feedbackEl.textContent = `❌ Wrong! Try again`;
    }
  }

  // Move to next stage
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

  // Keyboard input
  document.addEventListener("keydown", e => {
    if (e.key.length === 1) handleInput(e.key);
    else if (e.key === " ") handleInput("SPACE");
    else if (e.key === ";") handleInput(";");
  });
});
