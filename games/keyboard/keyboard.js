// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const year = urlParams.get("class") || "year1";
  const term = parseInt(urlParams.get("term")) || 1;
  const topicName = urlParams.get("topic") || "Keyboard Practice";

  let exercises = [];
  let currentExerciseIndex = 0;

  // Load keyboard.json
  fetch("keyboard.json")
    .then(res => res.json())
    .then(data => {
      const yearData = data.find(y => y.year === year);
      if (!yearData) throw new Error("Year data not found");

      const termData = yearData.terms.find(t => t.number === term);
      if (!termData) throw new Error("Term data not found");

      const category = termData.categories.find(c => c.id === "keyboard");
      if (!category) throw new Error("Keyboard category not found");

      const topic = category.topics.find(t => t.title === topicName);
      if (!topic) throw new Error("Topic not found");

      exercises = topic.exercise || [];
      showExercise();
    })
    .catch(err => {
      console.error("Error loading keyboard exercises:", err);
      questionContainer.innerHTML = "<p>⚠️ Failed to load keyboard exercises.</p>";
    });

  function showExercise() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    if (currentExerciseIndex >= exercises.length) {
      questionContainer.innerHTML = `
        <h2>🎉 Congratulations! You completed "${topicName}".</h2>
        <div style="margin-top:20px;">
          <button id="restart-btn" class="action-btn">Restart</button>
          <button id="back-btn" class="action-btn">Back To Classes</button>
          <button id="home-btn" class="action-btn">Home</button>
        </div>
      `;
      document.getElementById("restart-btn").onclick = () => {
        currentExerciseIndex = 0;
        showExercise();
      };
      document.getElementById("back-btn").onclick = () => {
        window.history.back();
      };
      document.getElementById("home-btn").onclick = () => {
        window.location.href = "index.html";
      };
      return;
    }

    const exerciseText = exercises[currentExerciseIndex];

    questionContainer.innerHTML = `
      <h2>${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
      <p>Type the following text exactly:</p>
      <div id="exercise-text" style="background:#f0f0ff;padding:12px;margin:15px 0;border-radius:6px;">${exerciseText}</div>
      <textarea id="user-input" rows="4" style="width:100%;padding:10px;border-radius:6px;border:1px solid #ccc;"></textarea>
    `;

    const userInput = document.getElementById("user-input");
    userInput.focus();

    userInput.addEventListener("input", checkInput);
  }

  function checkInput() {
    const userInput = document.getElementById("user-input");
    const exerciseText = exercises[currentExerciseIndex];

    if (userInput.value === exerciseText) {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
      currentExerciseIndex++;
      setTimeout(showExercise, 800); // move to next exercise
    } else if (!exerciseText.startsWith(userInput.value)) {
      feedback.textContent = "❌ Incorrect. Check your typing!";
      feedback.style.color = "red";
    } else {
      feedback.textContent = "";
    }
  }
});
