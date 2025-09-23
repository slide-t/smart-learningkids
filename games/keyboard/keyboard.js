let keyboardData = [];
let topicData = [];
let currentIndex = 0;
let activeKey = null;

async function loadData() {
  try {
    const keyboardRes = await fetch("keyboard.json");
    keyboardData = await keyboardRes.json();

    const classRes = await fetch("classes.json");
    topicData = await classRes.json();

    buildKeyboard();
    startGame();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function buildKeyboard() {
  const keyboardDiv = document.getElementById("keyboard");
  keyboardDiv.innerHTML = "";
  
  keyboardData.forEach(key => {
    const keyDiv = document.createElement("div");
    keyDiv.classList.add("key");
    keyDiv.textContent = key;
    keyDiv.dataset.key = key;
    keyDiv.addEventListener("click", () => handleKeyPress(key));
    keyboardDiv.appendChild(keyDiv);
  });
}

function startGame() {
  currentIndex = 0;
  highlightNextKey();
}

function highlightNextKey() {
  // remove previous highlight
  if (activeKey) {
    activeKey.classList.remove("glow");
  }

  if (currentIndex < topicData.length) {
    const nextChar = topicData[currentIndex].toUpperCase();
    const keyDiv = document.querySelector(`.key[data-key="${nextChar}"]`);
    if (keyDiv) {
      keyDiv.classList.add("glow");
      activeKey = keyDiv;
      document.getElementById("topic").textContent = "Press: " + nextChar;
    }
  } else {
    document.getElementById("topic").textContent = "🎉 Game Over!";
  }
}

function handleKeyPress(key) {
  if (currentIndex >= topicData.length) return;

  const expectedKey = topicData[currentIndex].toUpperCase();
  if (key === expectedKey) {
    currentIndex++;
    highlightNextKey();
  } else {
    alert("❌ Wrong key! Try again.");
  }
}

window.onload = loadData;
