// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Keyboard Practice";

  // Load exercises from keyboard.json
  fetch("keyboard.json")
    .then((res) => res.json())
    .then((data) => {
      let exercises = data[topicName] || [];
      let currentExerciseIndex = 0;

      function showExercise() {
        feedback.textContent = "";
        nextButton.classList.add("hidden");

        if (currentExerciseIndex >= exercises.length) {
          questionContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-green-600 text-center">🎉 Congratulations!</h2>
            <p class="text-center text-gray-700 mb-4">You completed the "${topicName}" practice.</p>
            <div class="flex flex-col sm:flex-row justify-center gap-3 mt-4">
              <button id="restart-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">🔄 Restart</button>
              <a href="../../index.html" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center">🏠 Home</a>
              <a href="../../classes.html" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center">📚 Back to Classes</a>
            </div>
          `;

          document.getElementById("restart-btn").onclick = () => {
            currentExerciseIndex = 0;
            showExercise();
          };
          return;
        }

        const exercise = exercises[currentExerciseIndex];

        questionContainer.innerHTML = `
          <h2 class="text-xl font-semibold text-purple-700 mb-2">${topicName} Exercise ${currentExerciseIndex + 1}/${exercises.length}</h2>
          <p class="mb-4 text-gray-600">${exercise.description}</p>
          <input id="answer-input" type="text" placeholder="Type here..." 
                 class="w-full border-2 border-purple-300 rounded-lg p-3 focus:outline-none focus:border-purple-500"/>
        `;

        const input = document.getElementById("answer-input");
        input.focus();

        input.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            checkAnswer(input.value.trim());
          }
        });

        nextButton.onclick = () => checkAnswer(input.value.trim());
      }

      function checkAnswer(answer) {
        const exercise = exercises[currentExerciseIndex];
        if (answer === exercise.answer) {
          feedback.textContent = "✅ Correct!";
          feedback.className = "mt-4 text-lg font-semibold text-green-600 text-center";
          currentExerciseIndex++;
          setTimeout(showExercise, 1000);
        } else {
          feedback.textContent = "❌ Wrong, try again!";
          feedback.className = "mt-4 text-lg font-semibold text-red-600 text-center";
        }
      }

      showExercise();
    })
    .catch((err) => {
      console.error("Error loading keyboard.json:", err);
      questionContainer.innerHTML =
        '<p class="text-red-600 text-center">⚠️ Failed to load keyboard exercises.</p>';
    });
});
