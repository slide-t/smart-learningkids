// keyboard.js (enhanced for special characters)

const targetCharEl = document.getElementById("targetChar");
const practiceArea = document.getElementById("practiceArea");
const virtualKeyboard = document.getElementById("virtualKeyboard");
const feedbackEl = document.getElementById("feedback");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const homeBtn = document.getElementById("homeBtn");

const correctSound = new Audio("sounds/correct.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");

let yearData = null;      
let currentTermIndex = 0;
let currentTopicIndex = 0;
let currentItemIndex = 0;
let currentCharIndex = 0;
let currentItem = "";
let enabledKeys = [];
let correct = 0;
let wrong = 0;

// All keys including special characters
const baseKeys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
const specialKeys = ["SPACE", "ENTER", "BACKSPACE", ",", ".", "!", "?", ";", ":", "$", "@"];

// Load year topics
async function loadYear(yearId) {
  const res = await fetch("data/classes.json");
  const classes = await res.json();
  yearData = classes.find(y => y.id === yearId);

  if (!yearData) {
    feedbackEl.textContent = "⚠️ Year not found!";
    return;
  }

  currentTermIndex = 0;
  currentTopicIndex = 0;
  currentItemIndex = 0;
  currentCharIndex = 0;
}

// Start practice
function startPractice() {
  startBtn.classList.add("hidden");
  practiceArea.classList.remove("hidden");
  virtualKeyboard.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  restartBtn.classList.remove("hidden");

  loadTopic();
}

// Load current topic
function loadTopic() {
  const term = yearData.terms[currentTermIndex];
  const topic = term.categories.find(c => c.id === "keyboard").topics[currentTopicIndex];

  if (term.locked) {
    feedbackEl.textContent = `🔒 Locked until ${term.unlockDate}`;
    targetCharEl.textContent = "-";
    disableAllKeys();
    return;
  }

  currentItemIndex = 0;
  currentCharIndex = 0;
  currentItem = topic.items[currentItemIndex];
  feedbackEl.textContent = topic.description || "";
  highlightNextChar();
}

// Highlight the next character
function highlightNextChar() {
  disableAllKeys();
  if (!currentItem) return;

  let nextChar = currentItem[currentCharIndex];
  if (!nextChar) return;

  // Map special cases
  if (nextChar === " ") nextChar = "SPACE";
  if (nextChar === "\n") nextChar = "ENTER";

  targetCharEl.textContent = nextChar === "SPACE" ? "⎵" : nextChar;

  // Enable only the required key
  enabledKeys = [nextChar.toUpperCase()];

  // Show active highlight on virtual keyboard
  virtualKeyboard.querySelectorAll(".key").forEach(k => k.classList.remove("active"));
  let keyEl = virtualKeyboard.querySelector(`[data-key="${nextChar.toUpperCase()}"]`);
  if (!keyEl) {
    // Add the special key dynamically if missing
    keyEl = document.createElement("div");
    keyEl.className = "key";
    keyEl.setAttribute("data-key", nextChar.toUpperCase());
    keyEl.textContent = nextChar === "SPACE" ? "⎵" : nextChar;
    keyEl.addEventListener("click", () => handleInput(nextChar.toUpperCase()));
    virtualKeyboard.appendChild(keyEl);
  }
  keyEl.classList.add("active");
}

// Handle user input
function handleInput(input) {
  if (!currentItem) return;

  let expectedChar = currentItem[currentCharIndex];
  if (!expectedChar) return;

  let expectedKey = expectedChar.toUpperCase();
  if (expectedChar === " ") expectedKey = "SPACE";
  if (expectedChar === "\n") expectedKey = "ENTER";

  if (input.toUpperCase() === expectedKey) {
    correct++;
    correctSound.play();
    currentCharIndex++;

    if (currentCharIndex >= currentItem.length) {
      currentItemIndex++;
      const term = yearData.terms[currentTermIndex];
      const topic = term.categories.find(c => c.id === "keyboard").topics[currentTopicIndex];
      if (currentItemIndex < topic.items.length) {
        currentItem = topic.items[currentItemIndex];
        currentCharIndex = 0;
      } else {
        currentTopicIndex++;
        currentItemIndex = 0;
        currentCharIndex = 0;
        const nextTopic = term.categories.find(c => c.id === "keyboard").topics[currentTopicIndex];
        if (nextTopic) {
          currentItem = nextTopic.items[0];
        } else {
          currentTermIndex++;
          currentTopicIndex = 0;
          if (currentTermIndex < yearData.terms.length) {
            loadTopic();
            return;
          } else {
            feedbackEl.textContent = "🎉 All topics completed!";
            disableAllKeys();
            return;
          }
        }
      }
    }

    highlightNextChar();
  } else {
    wrong++;
    wrongSound.play();
    feedbackEl.textContent = `❌ Wrong! Expected "${expectedChar}"`;
  }

  updateScore();
}

// Update score
function updateScore() {
  const total = correct + wrong;
  const accuracy = total ? Math.round((correct / total) * 100) + "%" : "0%";
  feedbackEl.textContent += ` | Correct: ${correct}, Wrong: ${wrong}, Accuracy: ${accuracy}`;
}

// Disable all keys
function disableAllKeys() {
  virtualKeyboard.querySelectorAll(".key").forEach(k => k.classList.remove("active"));
  enabledKeys = [];
}

// Setup virtual keyboard click
function setupVirtualKeyboard() {
  virtualKeyboard.querySelectorAll(".key").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      if (enabledKeys.includes(key)) handleInput(key);
    });
  });
}

// Physical keyboard input
document.addEventListener("keydown", e => {
  let key = e.key.toUpperCase();
  if (key === " ") key = "SPACE";
  handleInput(key);
});

// Buttons
startBtn.addEventListener("click", startPractice);
nextBtn.addEventListener("click", highlightNextChar);
restartBtn.addEventListener("click", () => location.reload());
homeBtn.addEventListener("click", () => window.location.href = "classes.html");

// Load default year
loadYear("year1");
setupVirtualKeyboard();
