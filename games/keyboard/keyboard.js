document.addEventListener("DOMContentLoaded", () => {
  const practiceArea = document.getElementById("practiceArea");
  const targetCharEl = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");

  let yearData = null;
  let stageIndex = 0;
  let itemIndex = 0;
  let charIndex = 0;
  let target = "";
  let score = 0;

  const layouts = {
    letters: [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L",";"],
      ["Z","X","C","V","B","N","M",",",".","/"]
    ],
    numbers: [["1","2","3","4","5","6","7","8","9","0"]],
    symbols: [["-","+","=","'","\"","!","?","@","#","$"]]
  };

  async function loadYear(yearId) {
    try {
      const res = await fetch("data/keyboard.json");
      const json = await res.json();
      yearData = json.levels[yearId];

      if (!yearData) {
        feedbackEl.textContent = "⚠️ Year not found or locked!";
        startBtn.disabled = true;
        return;
      }
      stageIndex = 0;
      itemIndex = 0;
      charIndex = 0;
      startBtn.disabled = false;
    } catch (err) {
      console.error(err);
      feedbackEl.textContent = "❌ Failed to load year data";
    }
  }

  function getCurrentStage() {
    if (!yearData) return null;
    return yearData.stages[stageIndex];
  }

  function renderKeyboard(char) {
    const layout = /^[a-zA-Z;,./]$/.test(char)
      ? layouts.letters
      : /^[0-9]$/.test(char)
        ? layouts.numbers
        : layouts.symbols;

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
      .find(k => k.dataset.key.toUpperCase() === (char === " " ? "SPACE" : char.toUpperCase()));
    if (keyBtn) {
      keyBtn.classList.remove("disabled");
      keyBtn.classList.add("active");
    }
  }

  function nextChar() {
    const stage = getCurrentStage();
    if (!stage) return;

    // Handle locked stage logic here (example: stageIndex > 0 locked)
    if (isStageLocked(stageIndex)) {
      feedbackEl.textContent = `🔒 This stage is locked.`;
      targetCharEl.textContent = "-";
      virtualKeyboard.innerHTML = "";
      return;
    }

    target = stage.items[itemIndex];
    charIndex = 0;
    targetCharEl.textContent = target[charIndex];
    feedbackEl.textContent = stage.title;
    renderKeyboard(target[charIndex]);
    highlightKey(target[charIndex]);
  }

  function handleInput(input) {
    if (!target) return;
    let expected = target[charIndex];
    if (expected === " ") expected = "SPACE";

    if (input.toUpperCase() === expected.toUpperCase()) {
      charIndex++;
      if (charIndex < target.length) {
        targetCharEl.textContent = target[charIndex];
        renderKeyboard(target[charIndex]);
        highlightKey(target[charIndex]);
      } else {
        score += 10;
        feedbackEl.textContent = `✅ Correct! Score: ${score}`;
        itemIndex++;
        const stage = getCurrentStage();
        if (stage && itemIndex < stage.items.length) {
          nextChar();
        } else {
          stageIndex++;
          itemIndex = 0;
          charIndex = 0;
          if (stageIndex < yearData.stages.length) nextChar();
          else endPractice();
        }
      }
    } else {
      feedbackEl.textContent = `❌ Wrong! Try again`;
    }
  }

  function endPractice() {
    feedbackEl.textContent = `🎉 All stages complete! Final Score: ${score}`;
    practiceArea.classList.add("hidden");
    virtualKeyboard.classList.add("hidden");
  }

  function isStageLocked(index) {
    // Example lock rule: only first stage unlocked, others locked
    return index > 0;
  }

  startBtn.addEventListener("click", () => {
    practiceArea.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    virtualKeyboard.classList.remove("hidden");
    nextChar();
  });

  nextBtn.addEventListener("click", () => {
    stageIndex++;
    itemIndex = 0;
    charIndex = 0;
    nextChar();
  });

  restartBtn.addEventListener("click", () => {
    stageIndex = 0;
    itemIndex = 0;
    charIndex = 0;
    score = 0;
    practiceArea.classList.add("hidden");
    virtualKeyboard.classList.add("hidden");
    feedbackEl.textContent = "";
  });

  homeBtn.addEventListener("click", () => window.location.href = "classes.html");

  document.addEventListener("keydown", e => {
    if (e.key.length === 1) handleInput(e.key);
    else if (e.key === " ") handleInput("SPACE");
    else if (e.key === ";") handleInput(";");
  });

  // Load the default year (can be dynamic from URL query)
  const urlParams = new URLSearchParams(window.location.search);
  const yearId = urlParams.get("year") || "1";
  loadYear(yearId);
});
