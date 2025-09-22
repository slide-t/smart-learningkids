document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("lesson-title");
  const instrEl = document.getElementById("lesson-instructions");
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score-display");
  const progressEl = document.getElementById("progress-display");
  const btns = document.getElementById("game-buttons");
  const restartBtn = document.getElementById("restart-btn");
  const nextBtn = document.getElementById("next-btn");
  const homeBtn = document.getElementById("home-btn");

  // Topic from query
  const urlParams = new URLSearchParams(window.location.search);
  const topicId = urlParams.get("topic") || null;
  const termId = urlParams.get("term") || "term1"; // default to term1

  // Fetch JSON
  fetch("keyboard.json")
    .then(res => res.json())
    .then(data => {
      const terms = data.terms;
      const term = terms.find(t => t.id === termId && t.unlocked);
      if (!term) {
        titleEl.textContent = "❌ Term is locked or not found.";
        return;
      }

      let topicIndex = term.topics.findIndex(t => t.id === topicId);
      if (topicIndex === -1) topicIndex = 0; // fallback to first

      let currentTopic = term.topics[topicIndex];

      // Game state
      let words = [...currentTopic.content];
      let currentWord = null;
      let fallingY = 0;
      let score = 0;
      let total = words.length;
      let gameOver = false;
      let speed = 2; // pixels per frame

      function startGame() {
        titleEl.textContent = currentTopic.title;
        instrEl.textContent = currentTopic.instructions;
        score = 0;
        scoreEl.textContent = `Score: ${score}`;
        progressEl.textContent = `0 / ${total}`;
        btns.classList.add("hidden");
        gameOver = false;
        nextWord();
        animate();
      }

      function nextWord() {
        if (words.length === 0) {
          endGame();
          return;
        }
        currentWord = words.shift();
        fallingY = 0;
      }

      function animate() {
        if (gameOver) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = "32px monospace";
        ctx.fillStyle = "#1f2937"; // gray-800
        ctx.fillText(currentWord, canvas.width / 2 - ctx.measureText(currentWord).width / 2, fallingY);

        fallingY += speed;
        if (fallingY > canvas.height - 20) {
          // Word missed
          nextWord();
        }

        requestAnimationFrame(animate);
      }

      // Typing check
      document.addEventListener("keydown", e => {
        if (gameOver || !currentWord) return;
        if (e.key === currentWord[0]) {
          currentWord = currentWord.slice(1);
          if (currentWord.length === 0) {
            score++;
            scoreEl.textContent = `Score: ${score}`;
            progressEl.textContent = `${score} / ${total}`;
            nextWord();
          }
        }
      });

      function endGame() {
        gameOver = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "28px sans-serif";
        ctx.fillStyle = "#059669"; // green-600
        ctx.fillText("🎉 Well done! Topic complete.", 100, canvas.height / 2);
        btns.classList.remove("hidden");

        // Next button control
        if (topicIndex < term.topics.length - 1) {
          nextBtn.classList.remove("hidden");
        } else {
          nextBtn.classList.add("hidden");
        }
      }

      // Button handlers
      restartBtn.addEventListener("click", () => {
        words = [...currentTopic.content];
        startGame();
      });

      nextBtn.addEventListener("click", () => {
        if (topicIndex < term.topics.length - 1) {
          topicIndex++;
          currentTopic = term.topics[topicIndex];
          words = [...currentTopic.content];
          total = words.length;
          startGame();
          window.history.replaceState(null, "", `?term=${termId}&topic=${currentTopic.id}`);
        }
      });

      homeBtn.addEventListener("click", () => {
        window.location.href = "index.html";
      });

      // Start first game
      startGame();
    });
});
