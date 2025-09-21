document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Read URL parameters for class, term, category, topic
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Home Row Practice";
  const className = urlParams.get("class") || "Year1";

  let exercises = [];

  // Load keyboard exercises JSON
  fetch("keyboard.json")
    .then(response => response.json())
    .then(data => {
      if (data[className] && data[className][topicName]) {
        exercises = data[className][topicName];
        currentExerciseIndex = 0;
        showExercise();
      } else {
        questionContainer.innerHTML = "<p>⚠️ No exercises found for this topic.</p>";
      }
    })
    .catch(err => {
      console.error("❌ Error loading keyboard.json:", err);
      questionContainer.innerHTML = "<p>⚠️ Failed to load exercises.</p>";
    });

  let currentExerciseIndex = 0;

  function showExercise() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    if (currentExerciseIndex >= exercises.length) {
      questionContainer.innerHTML = `
        <h2>🎉 Congratulations! You completed "${topicName}" practice.</h2>
        <div style="margin-top:20px;">
          <button id="restart-btn" class="control-btn">Restart</button>
          <button id="back-btn" class="control-btn">Back to Classes</button>
          <button id="home-btn" class="control-btn">Home</button>
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

    const exercise = exercises[currentExerciseIndex];
    questionContainer.innerHTML = `
      <h2>${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
      <p>${exercise.description}</p>
      <input type="text" id="user-input" placeholder="Type here..." style="width:80%;padding:10px;font-size:18px;margin-top:15px;" autofocus>
      <div style="margin-top:15px;">
        <button id="check-btn" class="control-btn">Check</button>
      </div>
    `;

    document.getElementById("check-btn").onclick = () => {
      const userInput = document.getElementById("user-input").value.trim();
      if (userInput === exercise.expected) {
        feedback.textContent = "✅ Correct!";
        feedback.style.color = "green";
        currentExerciseIndex++;
        setTimeout(showExercise, 800);
      } else {
        feedback.textContent = `❌ Wrong! Try again.`;
        feedback.style.color = "red";
      }
    };
  }
});
