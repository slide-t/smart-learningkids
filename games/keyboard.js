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
const keys = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z",
  "SPACE","ENTER"
];

// 🚫 Prevent on-screen keyboard on mobile
document.addEventListener("touchstart", function (e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    e.preventDefault();
  }
}, { passive: false });

// Load data
async function loadData() {
  const res = await fetch("games/keyboard.json");
  data = await res.json();
}

// Start game
function startGame() {
  if (!data.length) {
    feedbackEl.textContent = "⚠️ Data not loaded!";
    return;
  }

  // Hide start screen & show game
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
      restartBtn.classList.remove("hidden"); // show restart when game ends
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

// Handle input
function handleInput(input) {
  if (!currentWord) return;

  if (input === "SPACE") input = " ";
  if (input === "ENTER") {
    wrong++;
    feedbackEl.textContent = `⏭ Skipped: ${currentWord}`;
    wrongSound.play();
    newWord();
    updateScore();
    return;
  }

  const expected = currentWord[currentIndex]?.toUpperCase();

  if (input.toUpperCase() === expected) {
    currentIndex++;
    fallingItemEl.classList.add("correct-flash");
    setTimeout(() => fallingItemEl.classList.remove("correct-flash"), 300);

    if (currentIndex >= currentWord.length) {
      correct++;
      feedbackEl.textContent = `✅ Correct: ${currentWord}`;
      correctSound.play();
      newWord();
    }
  } else {
    wrong++;
    feedbackEl.textContent = `❌ Wrong! Expected "${expected}"`;
    wrongSound.play();
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

// Virtual keyboard
function setupVirtualKeyboard() {
  if (window.innerWidth < 768) {
    virtualKeyboard.classList.remove("hidden");
    virtualKeyboard.innerHTML = "";
    keys.forEach(key => {
      const btn = document.createElement("button");
      btn.textContent = key === "SPACE" ? "⎵" : key;
      btn.className = "px-2 py-2 bg-indigo-100 rounded shadow text-sm key-btn";
      btn.addEventListener("click", () => {
        btn.classList.add("active");
        setTimeout(() => btn.classList.remove("active"), 200);
        handleInput(key);
      });
      virtualKeyboard.appendChild(btn);
    });
  }
}

// Keyboard input (desktop)
document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) {
    handleInput(e.key.toUpperCase());
  } else if (e.key === " ") {
    handleInput("SPACE");
  } else if (e.key === "Enter") {
    handleInput("ENTER");
  }
});

// ✅ Start button
startBtn.addEventListener("click", startGame);

// ✅ Restart button → back to start screen
restartBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  gameContainer.classList.add("hidden");
  startScreen.style.display = "flex"; // show start again
  feedbackEl.textContent = "";
});

// Load words
loadData();
