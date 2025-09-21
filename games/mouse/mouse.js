// mouse.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");

  // Read URL parameters for topic
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Mouse Practice";

  // Progressive exercises per topic
  const mouseExercises = {
    "Pointing": [
      { x: 50, y: 50, description: "Move your mouse to the top-left corner and click. 🖱️" },
      { x: 300, y: 100, description: "Point to the star ⭐ and click." },
      { x: 200, y: 200, description: "Move to the heart ❤️ and click." },
      { x: 400, y: 250, description: "Point to the smiley 😎 and click." },
      { x: 150, y: 350, description: "Move to the thumbs up 👍 and click." }
    ],
    "Single Click": [
      { x: 100, y: 50, description: "Click the square ◼️" },
      { x: 250, y: 120, description: "Click the triangle 🔺" },
      { x: 350, y: 200, description: "Click the circle ⚪" },
      { x: 150, y: 300, description: "Click the star ⭐" },
      { x: 300, y: 400, description: "Click the heart ❤️" }
    ],
    "Double Click": [
      { x: 100, y: 50, description: "Double click the folder 📁" },
      { x: 250, y: 150, description: "Double click the star ⭐" },
      { x: 350, y: 250, description: "Double click the circle ⚪" },
      { x: 200, y: 350, description: "Double click the square ◼️" },
      { x: 400, y: 100, description: "Double click the heart ❤️" }
    ],
    "Right Click": [
      { x: 150, y: 100, description: "Right-click the folder 📁" },
      { x: 300, y: 150, description: "Right-click the star ⭐" },
      { x: 200, y: 250, description: "Right-click the circle ⚪" },
      { x: 400, y: 300, description: "Right-click the triangle 🔺" },
      { x: 100, y: 400, description: "Right-click the heart ❤️" }
    ]
    // Add more topics progressively for Years 4–12
  };

  let exercises = mouseExercises[topicName] || [];
  let currentExerciseIndex = 0;

  function showExercise() {
    feedback.textContent = "";
    const container = document.getElementById("options-container");
    container.innerHTML = "";

    if (currentExerciseIndex >= exercises.length) {
      questionContainer.innerHTML = `
        <h2>🎉 Congratulations! You completed the "${topicName}" practice.</h2>
      `;
      createCompletionButtons();
      return;
    }

    const exercise = exercises[currentExerciseIndex];

    questionContainer.innerHTML = `
      <h2>${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
      <p>${exercise.description}</p>
      <div id="exercise-area" style="width:100%;height:400px;position:relative;border:2px dashed #ccc;margin-top:20px;">
        <button id="target-btn" style="
          position:absolute;
          top:${exercise.y}px;
          left:${exercise.x}px;
          padding:10px 15px;
          border-radius:8px;
          cursor:pointer;
        ">🖱️ Click Me</button>
      </div>
    `;

    const targetBtn = document.getElementById("target-btn");

    // Determine click type based on topic
    if (topicName === "Double Click") {
      let clickCount = 0;
      targetBtn.addEventListener("click", () => {
        clickCount++;
        if (clickCount === 2) {
          feedback.textContent = "✅ Correct Double Click!";
          feedback.style.color = "green";
          clickCount = 0;
          currentExerciseIndex++;
          setTimeout(showExercise, 800);
        }
      });
    } else if (topicName === "Right Click") {
      targetBtn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        feedback.textContent = "✅ Correct Right Click!";
        feedback.style.color = "green";
        currentExerciseIndex++;
        setTimeout(showExercise, 800);
      });
    } else {
      targetBtn.addEventListener("click", () => {
        feedback.textContent = "✅ Correct!";
        feedback.style.color = "green";
        currentExerciseIndex++;
        setTimeout(showExercise, 800);
      });
    }
  }

  function createCompletionButtons() {
    const container = document.getElementById("options-container");
    container.innerHTML = "";

    const restartBtn = document.createElement("button");
    restartBtn.textContent = "🔄 Restart Practice";
    restartBtn.className = "option-btn";
    restartBtn.addEventListener("click", () => {
      currentExerciseIndex = 0;
      showExercise();
    });

    const classesBtn = document.createElement("button");
    classesBtn.textContent = "📚 Back To Classes";
    classesBtn.className = "option-btn";
    classesBtn.addEventListener("click", () => {
      window.location.href = "../classes.html"; // Adjust path as needed
    });

    const homeBtn = document.createElement("button");
    homeBtn.textContent = "🏠 Home";
    homeBtn.className = "option-btn";
    homeBtn.addEventListener("click", () => {
      window.location.href = "../index.html"; // Adjust path as needed
    });

    container.appendChild(restartBtn);
    container.appendChild(classesBtn);
    container.appendChild(homeBtn);
  }

  showExercise();
});
