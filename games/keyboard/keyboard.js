document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const homeBtn = document.getElementById("homeBtn");
  const practiceArea = document.getElementById("practiceArea");
  const targetChar = document.getElementById("targetChar");
  const feedbackEl = document.getElementById("feedback");
  const virtualKeyboard = document.getElementById("virtualKeyboard");

  // --- GAME DATA (progressive stages) ---
  const stages = [
    {
      name: "Home Row Keys",
      description: "Practice typing the home row keys including semicolon.",
      items: ["a","s","d","f","j","k","l",";"]
    },
    {
      name: "Two-Letter Words",
      description: "Type these two-letter words.",
      items: ["at","on","in","up","to","it"]
    },
    {
      name: "Three-Letter Words",
      description: "Type these three-letter words.",
      items: ["cat","dog","sun","pen","car"]
    },
    {
      name: "Simple Words & Symbols",
      description: "Type simple words including special characters.",
      items: ["hi!","go?","ok.","fun#","yes$"]
    },
    {
      name: "Numbers Practice",
      description: "Practice numbers and symbols.",
      items: ["1","2","3","4","5","6","7","8","9","0","@", "#", "$", "%", "&", "*"]
    }
  ];

  let currentStageIndex = 0;
  let currentItemIndex = 0;
  let currentItem = "";

  // Keyboard layouts
  const layouts = {
    letters: [
      ["Q","W","E","R","T","Y","U","I","O","P"],
      ["A","S","D","F","G","H","J","K","L",";"],
      ["Z","X","C","V","B","N","M"]
    ],
    numbers: [["1","2","3","4","5","6","7","8","9","0"]],
    symbols: [["@", "#", "$", "%", "&", "*", "!", "?", ".", ","]]
  };

  let keyButtons = {};

  // --- Build virtual keyboard ---
  function setupVirtualKeyboard() {
    virtualKeyboard.innerHTML = "";
    virtualKeyboard.classList.remove("hidden");
    keyButtons = {};

    // Flatten layout for mapping buttons
    const allKeys = [...layouts.letters.flat(), ...layouts.numbers.flat(), ...layouts.symbols.flat(), "SPACE", "ENTER"];
    allKeys.forEach(key => {
      const btn = document.createElement("div");
      btn.textContent = key === "SPACE" ? "⎵" : key;
      btn.className = "key disabled"; // initially disabled
      btn.dataset.key = key;
      btn.addEventListener("click", () => {
        if (!btn.classList.contains("disabled")) {
          handleInput(key);
        }
      });
      virtualKeyboard.appendChild(btn);
      keyButtons[key.toUpperCase()] = btn;
    });
  }

  // Enable only needed keys for current character
  function highlightCurrentKey() {
    Object.values(keyButtons).forEach(btn => {
      btn.classList.add("disabled");
      btn.classList.remove("highlight");
    });

    if (!currentItem) return;

    const nextChar = currentItem[0];
    let keyToHighlight = nextChar.toUpperCase();
    if (nextChar === " ") keyToHighlight = "SPACE";

    const btn = keyButtons[keyToHighlight];
    if (btn) {
      btn.classList.remove("disabled");
      btn.classList.add("highlight");
    }

    // Enable other characters needed in the word
    [...currentItem.toUpperCase()].forEach(char => {
      if (char === " ") char = "SPACE";
      if (keyButtons[char]) keyButtons[char].classList.remove("disabled");
    });
  }

  function loadItem() {
    const stage = stages[currentStageIndex];
    if (!stage) return;

    if (currentItemIndex < stage.items.length) {
      currentItem = stage.items[currentItemIndex];
      targetChar.textContent = currentItem.toUpperCase();
      feedbackEl.textContent = "";
      highlightCurrentKey();
    } else {
      feedbackEl.textContent = `🎉 Stage Complete: ${stage.name}`;
      nextBtn.classList.remove("hidden");
      targetChar.textContent = "";
      Object.values(keyButtons).forEach(btn => btn.classList.add("disabled"));
    }
  }

  function handleInput(input) {
    if (!currentItem) return;
    if (input === "SPACE") input = " ";
    if (input === "ENTER") input = "";

    const expectedChar = currentItem[0];
    if (input.toLowerCase() === expectedChar.toLowerCase()) {
      feedbackEl.textContent = "✅ Correct!";
      currentItem = currentItem.slice(1);
      if (currentItem.length === 0) {
        currentItemIndex++;
        setTimeout(loadItem, 400);
      } else {
        targetChar.textContent = currentItem.toUpperCase();
        highlightCurrentKey();
      }
    } else {
      feedbackEl.textContent = `❌ Try again!`;
    }
  }

  startBtn.addEventListener("click", () => {
    practiceArea.classList.remove("hidden");
    startBtn.classList.add("hidden");
    currentStageIndex = 0;
    currentItemIndex = 0;
    nextBtn.classList.add("hidden");
    setupVirtualKeyboard();
    loadItem();
  });

  nextBtn.addEventListener("click", () => {
    currentStageIndex++;
    currentItemIndex = 0;
    nextBtn.classList.add("hidden");
    loadItem();
  });

  restartBtn.addEventListener("click", () => {
    currentStageIndex = 0;
    currentItemIndex = 0;
    practiceArea.classList.add("hidden");
    startBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
    feedbackEl.textContent = "";
    targetChar.textContent = "";
    Object.values(keyButtons).forEach(btn => btn.classList.add("disabled"));
  });

  homeBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  document.addEventListener("keydown", (e) => {
    let keyPressed = e.key;
    if (keyPressed === " ") keyPressed = "SPACE";
    else if (keyPressed === "Enter") keyPressed = "ENTER";

    const btn = keyButtons[keyPressed.toUpperCase()];
    if (btn && !btn.classList.contains("disabled")) {
      handleInput(keyPressed);
    }
  });
});
