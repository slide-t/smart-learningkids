//mouse.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Mouse Practice";

  // Define mouse exercises per topic
  const mouseExercises = {
    "Pointing": [
      { x: 100, y: 100, description: "Move your mouse to the top-left corner and click." },
      { x: 300, y: 150, description: "Point to the button and click it." },
      { x: 200, y: 250, description: "Move the cursor to the center and click." },
      { x: 400, y: 300, description: "Point to the box and click." },
      { x: 150, y: 400, description: "Move to the circle and click." }
    ],
    "Single Click": [
      { x: 200, y: 100, description: "Click on the star icon." },
      { x: 350, y: 150, description: "Click on the square." },
      { x: 100, y: 250, description: "Click the circle." },
      { x: 400, y: 300, description: "Click the triangle." },
      { x: 250, y: 400, description: "Click the rectangle." }
    ],
    "Click Practice": [
      { x: 150, y: 100, description: "Click on the highlighted emoji 😊" },
      { x: 300, y: 150, description: "Click the star ⭐" },
      { x: 200, y: 250, description: "Click the heart ❤️" },
      { x: 400, y: 300, description: "Click the smiley 😎" },
      { x: 100, y: 400, description: "Click the thumbs up 👍" }
    ]
    // Add more topics progressively for year8-year12
  };

  let exercises = mouseExercises[topicName] || [];
  let currentExerciseIndex = 0;

  function showExercise() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    if (currentExerciseIndex >= exercises.length) {
      questionContainer.innerHTML = `
        <h2>🎉 Congratulations! You completed the "${topicName}" practice.</h2>
      `;
      nextButton.textContent = "Restart";
      nextButton.classList.remove("hidden");
      nextButton.onclick = () => {
        currentExerciseIndex = 0;
        showExercise();
      };
      return;
    }

    const exercise = exercises[currentExerciseIndex];

    questionContainer.innerHTML = `
      <h2>${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
      <p>${exercise.description}</p>
      <div style="width:100%;height:400px;position:relative;border:2px dashed #ccc;margin-top:20px;" id="exercise-area">
        <button id="target-btn" style="
          position:absolute;
          top:${exercise.y}px;
          left:${exercise.x}px;
          padding:10px 15px;
          border-radius:8px;
          cursor:pointer;
        ">Click Me</button>
      </div>
    `;

    const targetBtn = document.getElementById("target-btn");
    targetBtn.addEventListener("click", () => {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
      currentExerciseIndex++;
      setTimeout(showExercise, 800); // Move to next exercise after 0.8s
    });
  }

  showExercise();
});
