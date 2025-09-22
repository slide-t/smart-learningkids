// ================== GLOBAL VARIABLES ==================
let topics = [];
let currentTopicIndex = 0;
let currentKeys = [];
let currentChar = "";
let gameStarted = false;

// DOM Elements
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");
const practiceArea = document.getElementById("practiceArea");
const targetChar = document.getElementById("targetChar");
const feedback = document.getElementById("feedback");
const virtualKeyboard = document.getElementById("virtualKeyboard");

// ================== LOAD TOPICS FROM JSON ==================
async function loadTopics() {
  try {
    const response = await fetch("keyboard.json");
    const data = await response.json();
    // Example: get first year -> first term -> subjects -> topics
    topics = data.years[0].terms[0].subjects[0].topics; 
  } catch (error) {
    console.error("Error loading topics:", error);
  }
}

// ================== START GAME ==================
function startGame() {
  gameStarted = true;
  startBtn.classList.add("hidden");
  practiceArea.classList.remove("hidden");
  virtualKeyboard.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  restartBtn.classList.remove("hidden");

  currentTopicIndex = 0;
  loadTopic(currentTopicIndex);
}

// ================== LOAD A TOPIC ==================
function loadTopic(index) {
  if (index >= topics.length) {
    feedback.textContent = "🎉 You finished all games in this term!";
    targetChar.textContent = "";
    return;
  }
  const topic = topics[index];
  currentKeys = topic.keys || [];
  feedback.textContent = `Topic: ${topic.title}`;
  newChar();
}

// ================== PICK NEW CHARACTER ==================
function newChar() {
  if (currentKeys.length === 0) return;
  currentChar = currentKeys[Math.floor(Math.random() * currentKeys.length)];
  targetChar.textContent = currentChar.toUpperCase();
  highlightKey(currentChar);
}

// ================== HIGHLIGHT KEY ON VIRTUAL KEYBOARD ==================
function highlightKey(char) {
  document.querySelectorAll(".key").forEach(k => k.classList.remove("active"));
  const keyDiv = document.querySelector(`.key[data-key="${char.toUpperCase()}"]`);
  if (keyDiv) keyDiv.classList.add("active");
}

// ================== HANDLE USER INPUT ==================
document.addEventListener("keydown", (e) => {
  if (!gameStarted || !currentChar) return;
  const pressed = e.key.toUpperCase();
  if (pressed === currentChar.toUpperCase()) {
    feedback.textContent = "✅ Correct!";
    feedback.className = "text-green-600 font-bold mt-4";
    newChar();
  } else {
    feedback.textContent = "❌ Wrong! Try again.";
    feedback.className = "text-red-600 font-bold mt-4";
  }
});

// ================== BUTTON ACTIONS ==================
nextBtn.addEventListener("click", () => {
  currentTopicIndex++;
  loadTopic(currentTopicIndex);
});

restartBtn.addEventListener("click", () => {
  loadTopic(currentTopicIndex);
});

homeBtn.addEventListener("click", () => {
  window.location.href = "index.html"; // or classes.html
});

startBtn.addEventListener("click", startGame);

// ================== INIT ==================
loadTopics();
