const timerEl = document.getElementById("timer");
const correctEl = document.getElementById("correct");
const wrongEl = document.getElementById("wrong");
const accuracyEl = document.getElementById("accuracy");
const feedbackEl = document.getElementById("feedback");
const fallingItemEl = document.getElementById("falling-item");
const virtualKeyboard = document.getElementById("virtual-keyboard");

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const restartBtn = document.getElementById("restart-btn");

// 🔊 Sounds
const correctSound = new Audio("sounds/correct.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");

let data = [];
let currentWord = "";
let currentIndex = 0;
let correct = 0;
let wrong = 0;
let timer = 420; // 7 mins
let timerInterval = null;

// 🎹 Virtual keyboard layout
const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ".split("");

// Load data
async function loadData() {
  const res = await fetch("games/keyboard.json");
  data = await res.json();
}

// Start Game
function startGame() {
  if (!data.length) {
    feedbackEl.textContent = "⚠️ Data not loaded!";
    return;
  }

  startScreen.style.display = "none";
  gameContainer.classList.remove("hidden");

  clearInterval(timerInterval);
  timer = 420;
  correct = 0;
  wrong = 0;

  updateScore();
  updateTimer();
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
      restartBtn.classList.remove("hidden");
    }
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const min = Math.floor(timer / 60).toString().padStart(2, "0");
  const sec = (timer % 60).toString().padStart(2, "0");
  timerEl.textContent = `${min}:${sec}`;
}

// New word
function newWord() {
  const stage = data[Math.floor(Math.random() * data.length)];
  currentWord = stage.words[Math.floor(Math.random() * stage.words.length)];
  currentIndex = 0;

  fallingItemEl.textContent = currentWord;
  fallingItemEl.classList.add("animate-fade-in");
  setTimeout(() => fallingItemEl.classList.remove("animate-fade-in"), 700);
}

// Handle input
function handleInput(input) {
  if (!currentWord) return;

  if (input === " ") input = "SPACE";

  const expected = currentWord[currentIndex]?.toUpperCase();

  if (input === expected) {
    currentIndex++;
    highlightKey(input, "correct");

    if (currentIndex >= currentWord.length) {
      correct++;
      feedbackEl.textContent = `✅ ${currentWord}`;
      correctSound.play();
      newWord();
    }
  } else {
    wrong++;
    feedbackEl.textContent = `❌ Expected "${expected}"`;
    wrongSound.play();
    highlightKey(input, "wrong");
  }

  updateScore();
}

// Highlight keys
function highlightKey(key, status) {
  const btn = [...virtualKeyboard.children].find(b => b.dataset.key === key);
  if (btn) {
    btn.classList.add(status === "correct" ? "bg-green-300" : "bg-red-300");
    setTimeout(() => btn.classList.remove("bg-green-300", "bg-red-300"), 400);
  }
}

// Update Score
function updateScore() {
  correctEl.textContent = correct;
  wrongEl.textContent = wrong;
  const total = correct + wrong;
  accuracyEl.textContent = total ? Math.round((correct / total) * 100) + "%" : "0%";
}

// Virtual Keyboard
function setupVirtualKeyboard() {
  if (window.innerWidth < 768) {
    virtualKeyboard.classList.remove("hidden");
    virtualKeyboard.innerHTML = "";
    keys.forEach(k => {
      const btn = document.createElement("button");
      btn.textContent = k === " " ? "⎵" : k;
      btn.dataset.key = k === " " ? "SPACE" : k;
      btn.className = "p-2 bg-gray-200 rounded shadow text-sm";
      btn.addEventListener("click", () => handleInput(btn.dataset.key));
      virtualKeyboard.appendChild(btn);
    });
  }
}

// Keyboard input (desktop)
document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) handleInput(e.key.toUpperCase());
  else if (e.key === " ") handleInput("SPACE");
});

// ✅ Start
startBtn.addEventListener("click", startGame);

// ✅ Restart
restartBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  gameContainer.classList.add("hidden");
  startScreen.style.display = "flex";
  feedbackEl.textContent = "";
});

// Load words
loadData();
