document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Use global variables set in HTML
  const topicName = window.topicName || "Mouse Practice";
  const year = window.mouseYear || 1;

  // Define progressive exercises
  const mouseExercises = {
    1: { // Year 1
      "Pointing": [
        { x: 50, y: 50, description: "Move your mouse to the top-left corner and click 😊" },
        { x: 150, y: 100, description: "Point to the star ⭐ and click." },
        { x: 200, y: 200, description: "Move to the circle 🔵 and click." },
        { x: 300, y: 250, description: "Click the square ⬜" },
        { x: 100, y: 300, description: "Click the triangle 🔺" }
      ],
      "Single Click": [
        { x: 100, y: 100, description: "Click on the smiley 😎" },
        { x: 200, y: 150, description: "Click the heart ❤️" },
        { x: 250, y: 200, description: "Click the thumbs up 👍" },
        { x: 300, y: 250, description: "Click the star ⭐" },
        { x: 150, y: 300, description: "Click the diamond 💎" }
      ]
    },
    2: { // Year 2 (more varied positions)
      "Pointing": [
        { x: 60, y: 60, description: "Click on the smiley 😃" },
        { x: 180, y: 120, description: "Click the star ⭐" },
        { x: 250, y: 220, description: "Click the heart ❤️" },
        { x: 320, y: 280, description: "Click the thumbs up 👍" },
        { x: 140, y: 350, description: "Click the diamond 💎" }
      ],
      "Single Click": [
        { x: 100, y: 80, description: "Click the moon 🌙" },
        { x: 200, y: 150, description: "Click the sun ☀️" },
        { x: 300, y: 220, description: "Click the cloud ☁️" },
        { x: 400, y: 300, description: "Click the star ⭐" },
        { x: 150, y: 350, description: "Click the heart ❤️" }
      ]
    },
    3: { // Year 3 (introduce double click)
      "Double Click": [
        { x: 100, y: 100, description: "Double click on the star ⭐" },
        { x: 200, y: 150, description: "Double click the heart ❤️" },
        { x: 300, y: 220, description: "Double click the smiley 😎" },
        { x: 400, y: 280, description: "Double click the thumbs up 👍" },
        { x: 150, y: 350, description: "Double click the diamond 💎" }
      ]
    },
    4: { // Year 4 (Right click practice)
      "Right Click": [
        { x: 100, y: 100, description: "Right click on the star ⭐" },
        { x: 200, y: 150, description: "Right click the heart ❤️" },
        { x: 300, y: 220, description: "Right click the smiley 😎" },
        { x: 400, y: 280, description: "Right click the thumbs up 👍" },
        { x: 150, y: 350, description: "Right click the diamond 💎" }
      ]
    }
    // Add more topics progressively for years 5-12
  };

  const exercises = (mouseExercises[year] && mouseExercises[year][topicName]) || [];
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

      // Add Back To Classes and Home buttons
      const backBtn = document.createElement("button");
      backBtn.textContent = "Back To Classes";
      backBtn.style.marginTop = "10px";
      backBtn.style.padding = "10px 15px";
      backBtn.style.borderRadius = "8px";
      backBtn.style.cursor = "pointer";
      backBtn.onclick = () => window.location.href = "../classes.html";
      questionContainer.appendChild(backBtn);

      const homeBtn = document.createElement("button");
      homeBtn.textContent = "Home";
      homeBtn.style.marginTop = "10px";
      homeBtn.style.marginLeft = "10px";
      homeBtn.style.padding = "10px 15px";
      homeBtn.style.borderRadius = "8px";
      homeBtn.style.cursor = "pointer";
      homeBtn.onclick = () => window.location.href = "../../index.html";
      questionContainer.appendChild(homeBtn);

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
        ">🖱️ Click Me</button>
      </div>
    `;

    const targetBtn = document.getElementById("target-btn");

    if (topicName.toLowerCase().includes("double click")) {
      targetBtn.addEventListener("dblclick", () => {
        feedback.textContent = "✅ Correct Double Click!";
        feedback.style.color = "green";
        currentExerciseIndex++;
        setTimeout(showExercise, 800);
      });
    } else if (topicName.toLowerCase().includes("right click")) {
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

  showExercise();
});
