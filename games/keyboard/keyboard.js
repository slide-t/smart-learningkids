// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("keyboard-game");
  const restartBtn = document.getElementById("restart-btn");
  const backBtn = document.getElementById("back-btn");
  const homeBtn = document.getElementById("home-btn");

  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.className = "border rounded bg-gray-100 w-full";
  container.innerHTML = "";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  // Game state
  let letters = [];
  let score = 0;
  let lives = 3;
  let active = true;

  // Home row letters
  const homeRow = ["a", "s", "d", "f", "j", "k", "l", ";"];

  function spawnLetter() {
    if (!active) return;
    const text = homeRow[Math.floor(Math.random() * homeRow.length)];
    letters.push({
      text,
      x: Math.random() * (canvas.width - 50) + 20,
      y: -20,
      speed: 1 + Math.random() * 1.5,
      born: Date.now(),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Score + lives
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 80, 20);

    // Letters
    ctx.font = "32px Arial";
    letters.forEach((l) => {
      ctx.fillStyle = "blue";
      ctx.fillText(l.text, l.x, l.y);
    });
  }

  function update() {
    const now = Date.now();
    letters.forEach((l) => {
      l.y += l.speed;
      if (now - l.born > 3000) {
        // too late
        letters = letters.filter((x) => x !== l);
        lives--;
        if (lives <= 0) endGame();
      }
    });
    letters = letters.filter((l) => l.y < canvas.height + 20);
  }

  function loop() {
    if (!active) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function handleKey(e) {
    if (!active) return;
    const key = e.key.toLowerCase();
    const match = letters.find((l) => l.text.toLowerCase() === key);
    if (match) {
      score += 10;
      letters = letters.filter((l) => l !== match);
    }
  }

  function endGame() {
    active = false;
    ctx.fillStyle = "green";
    ctx.font = "28px Arial";
    ctx.fillText("🎉 Well done! Home Row complete.", 60, canvas.height / 2);

    // Show buttons
    restartBtn.style.display = "inline-block";
    backBtn.style.display = "inline-block";
    homeBtn.style.display = "inline-block";
  }

  // Events
  document.addEventListener("keydown", handleKey);

  if (restartBtn)
    restartBtn.addEventListener("click", () => {
      location.reload();
    });
  if (backBtn) backBtn.addEventListener("click", () => (window.location.href = "classes.html"));
  if (homeBtn) homeBtn.addEventListener("click", () => (window.location.href = "index.html"));

  // Start game
  setInterval(spawnLetter, 2000); // spawn every 2s
  loop();
});
