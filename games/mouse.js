document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  let questions = [];
  let currentQuestionIndex = 0;

  // Load classes.json and extract mouse topics
  fetch("data/classes.json")
    .then((res) => res.json())
    .then((data) => {
      const classes = Array.isArray(data) ? data : data.classes;

      classes.forEach((cls) => {
        cls.terms?.forEach((term) => {
          term.categories?.forEach((cat) => {
            if (cat.id === "mouse") {
              cat.topics?.forEach((topic) => {
                questions.push({
                  question: topic.title,
                  options: ["Practice", "Review", "Skip", "Check"], // Placeholder options; can be customized
                  answer: "Practice", // Default correct answer placeholder
                  link: topic.link,
                });
              });
            }
          });
        });
      });

      if (questions.length === 0) {
        questionContainer.innerHTML =
          "<h2>No mouse topics found in classes.json</h2>";
        return;
      }

      showQuestion();
    })
    .catch((err) => {
      console.error("Error loading classes.json:", err);
      questionContainer.innerHTML =
        "<h2>Error loading mouse topics. Check console.</h2>";
    });

  function showQuestion() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    const q = questions[currentQuestionIndex];

    questionContainer.innerHTML = `
      <h2>${q.question}</h2>
      <div class="options">
        ${q.options
          .map(
            (opt, idx) =>
              `<button class="option-btn" data-index="${idx}">${opt}</button>`
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
    const q = questions[currentQuestionIndex];

    if (q.options[selectedIndex] === q.answer) {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Wrong! The correct answer is: ${q.answer}`;
      feedback.style.color = "red";
    }

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
      questionContainer.innerHTML =
        "<h2>🎉 Well done! You completed all the Mouse questions.</h2>";
      nextButton.classList.add("hidden");
    }
  });
});
