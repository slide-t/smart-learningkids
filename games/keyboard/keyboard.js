let topics = [];
let currentTopicIndex = 0;
let currentContent = [];
let score = 0;
let progress = 0;
let activeWord = "";
let gameOver = false;

const topicsContainer = document.getElementById("topics-container");
const gameContainer = document.getElementById("game-container");
const lessonTitle = document.getElementById("lesson-title");
const lessonInstructions = document.getElementById("lesson-instructions");
const typingInput = document.getElementById("typing-input");
const promptEl = document.getElementById("prompt");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score-display");
const progressEl = document.getElementById("progress-display");
const restartBtn = document.getElementById("restart-btn");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const canvas = document.getElementById("falling-keys-canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let fallingItems = [];
let fallSpeed = 1.5;
let spawnInterval;
let animationFrame;

// Load topics
fetch("keyboard.json")
  .then(res => res.json())
  .then(data => {
    topics = data.topics;
    renderTopics();
  });

// Render topics on page
function renderTopics() {
  topicsContainer.innerHTML = "";
  topics.forEach((topic, index) => {
    const btn = document.createElement("button");
    btn.textContent = topic.title;
    btn.className = "p-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition";
    btn.addEventListener("click", () => loadTopic(index));
    topicsContainer.appendChild(btn);
  });
}

// Load a topic
function loadTopic(index) {
  currentTopicIndex = index;
  const topic = topics[index];
  currentContent = [...topic.content];
  score = 0;
  progress = 0;
  gameOver = false;
  fallingItems = [];

  lessonTitle.textContent = topic.title;
  lessonInstructions.textContent = topic.instructions;
  scoreEl.textContent = `Score: ${score}`;
  progressEl.textContent = `${progress} / ${currentContent.length}`;
  typingInput.value = "";
  typingInput.disabled = false;
  typingInput.focus();
  feedbackEl.textContent = "";

  topicsContainer.parentElement.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  restartBtn.classList.add("hidden");
  nextBtn.classList.add("hidden");
  backBtn.classList.add("hidden");

  startFallingGame();
}

// Start falling keys/words
function startFallingGame() {
  clearInterval(spawnInterval);
  cancelAnimationFrame(animationFrame);
  fallingItems = [];

  spawnInterval = setInterval(() => {
    if (progress >= currentContent.length) return;
    const text = currentContent[progress];
    const x = Math.random() * (canvas.width - 40) + 20;
    fallingItems.push({ text, x, y: 0 });
  }, 2000);

  animateFalling();
}

// Animate falling items
function animateFalling() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px monospace";
  ctx.fillStyle = "blue";

  fallingItems.forEach(item => {
    ctx.fillText(item.text, item.x, item.y);
    item.y += fallSpeed;

    if (item.y > canvas.height - 20 && !gameOver) {
      feedbackEl.textContent = `⏱ Missed: ${item.text}`;
      feedbackEl.className = "text-red-600 font-semibold";
      endGame();
    }
  });

  animationFrame = requestAnimationFrame(animateFalling);
}

// Typing input check
typingInput.addEventListener("input", () => {
  const value = typingInput.value.trim();
  if (value === currentContent[progress]) {
    score++;
    progress++;
    scoreEl.textContent = `Score: ${score}`;
    progressEl.textContent = `${progress} / ${currentContent.length}`;
    feedbackEl.textContent = "✅ Correct!";
    feedbackEl.className = "text-green-600 font-semibold";
    typingInput.value = "";

    // Remove matched item from fallingItems
    fallingItems = fallingItems.filter(item => item.text !== value);

    if (progress >= currentContent.length) {
      endGame();
    }
  }
});

// End game
function endGame() {
  gameOver = true;
  clearInterval(spawnInterval);
  cancelAnimationFrame(animationFrame);
  typingInput.disabled = true;

  feedbackEl.textContent = "🎉 Well done! You finished this practice.";
  feedbackEl.className = "text-green-600 font-semibold mt-2";

  restartBtn.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
  backBtn.classList.remove("hidden");
}

// Restart current topic
restartBtn.addEventListener("click", () => {
  loadTopic(currentTopicIndex);
});

// Next topic
nextBtn.addEventListener("click", () => {
  if (currentTopicIndex < topics.length - 1) {
    loadTopic(currentTopicIndex + 1);
  } else {
    alert("🎉 You've completed all keyboard practices!");
    window.location.href = "classes.html";
  }
});

// Back to topics/home
backBtn.addEventListener("click", () => {
  window.location.href = "classes.html";
});
