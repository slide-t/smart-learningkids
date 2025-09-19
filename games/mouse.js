
// mouse.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  let questions = [];
  let currentQuestionIndex = 0;

  // Load questions from mouse.json
  fetch("mouse.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data;
      showQuestion();
    })
    .catch((error) => {
      console.error("Error loading questions:", error);
    });

  function showQuestion() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    const question = questions[currentQuestionIndex];
    questionContainer.innerHTML = `
      <h2>${question.question}</h2>
      <div class="options">
        ${question.options
          .map(
            (option, index) =>
              `<button class="option-btn" data-index="${index}">${option}</button>`
          )
          .join("")}
      </div>
    `;

    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", selectAnswer);
    });
  }

  function selectAnswer(e) {
    const selectedBtn = e.target;
    const selectedIndex = selectedBtn.dataset.index;
    const question = questions[currentQuestionIndex];

    if (question.options[selectedIndex] === question.answer) {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Wrong! The correct answer is: ${question.answer}`;
      feedback.style.color = "red";
    }

    // Disable all buttons after selection
    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.disabled = true;
    });

    nextButton.classList.remove("hidden");
  }

  nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      questionContainer.innerHTML = `<h2>🎉 Well done! You completed all the Mouse questions.</h2>`;
      nextButton.classList.add("hidden");
    }
  });
});
