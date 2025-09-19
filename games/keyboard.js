// keyboard.js

const timerEl = document.getElementById("timer");
const correctEl = document.getElementById("correct");
const wrongEl = document.getElementById("wrong");
const accuracyEl = document.getElementById("accuracy");
const feedbackEl = document.getElementById("feedback");
const fallingItemEl = document.getElementById("falling-item");
const virtualKeyboard = document.getElementById("virtual-keyboard");

let data = [];
let currentWord = "";
let currentIndex = 0;
let correct = 0;
let wrong = 0;
let timer = 420; // 7 mins
let timerInterval = null;

// 🎹 Virtual keyboard layout (simplified for kids)
const keys = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z",
  "SPACE","ENTER"
];

// Load data
async function loadData() {
  const res = await fetch("./keyboard.json");
  data = await res.json();
  startGame();
}

// Start game
function startGame() {
  correct = 0;
  wrong = 0;
  updateScore();
  startTimer();
  newWord();
  setupVirtualKeyboard();
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    if (timer <= 0) {
      clearInterval(timerInterval);
      feedbackEl.textContent = "⏰ Time’s up!";
    }
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const min = Math.floor(timer / 60).toString().padStart(2, "0");
  const sec = (timer % 60).toString().padStart(2, "0");
  timerEl.textContent = `${min}:${sec}`;
}

// Pick new word
function newWord() {
  const randomStage = data[Math.floor(Math.random() * data.length)];
  currentWord = randomStage.words[Math.floor(Math.random() * randomStage.words.length)];
  currentIndex = 0;
  fallingItemEl.textContent = currentWord;
  fallingItemEl.classList.remove("shake");
  fallingItemEl.classList.add("drop-enter");
  setTimeout(() => fallingItemEl.classList.remove("drop-enter"), 700);
}

// Handle key press
function handleInput(input) {
  if (!currentWord) return;

  if (input === "SPACE") input = " ";
  if (input === "ENTER") {
    // force skip to next word
    wrong++;
    feedbackEl.textContent = `⏭ Skipped: ${currentWord}`;
    newWord();
    updateScore();
    return;
  }

  const expected = currentWord[currentIndex]?.toUpperCase();
  if (input.toUpperCase() === expected) {
    currentIndex++;
    if (currentIndex >= currentWord.length) {
      correct++;
      feedbackEl.textContent = `✅ Correct: ${currentWord}`;
      newWord();
    }
  } else {
    wrong++;
    feedbackEl.textContent = `❌ Wrong! Expected "${expected}"`;
    fallingItemEl.classList.add("shake");
    setTimeout(() => fallingItemEl.classList.remove("shake"), 500);
  }
  updateScore();
}

// Update score
function updateScore() {
  correctEl.textContent = correct;
  wrongEl.textContent = wrong;
  const total = correct + wrong;
  accuracyEl.textContent = total ? Math.round((correct / total) * 100) + "%" : "0%";
}

// Virtual keyboard setup
function setupVirtualKeyboard() {
  // Only show on small screens
  if (window.innerWidth < 768) {
    virtualKeyboard.classList.remove("hidden");
    virtualKeyboard.innerHTML = "";
    keys.forEach(key => {
      const btn = document.createElement("button");
      btn.textContent = key === "SPACE" ? "⎵" : key;
      btn.className = "px-2 py-2 bg-indigo-100 rounded shadow text-sm";
      btn.addEventListener("click", () => handleInput(key));
      virtualKeyboard.appendChild(btn);
    });
  }
}

// Desktop keyboard input
document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) {
    handleInput(e.key.toUpperCase());
  } else if (e.key === " ") {
    handleInput("SPACE");
  } else if (e.key === "Enter") {
    handleInput("ENTER");
  }
});

loadData();
