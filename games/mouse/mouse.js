document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const optionsContainer = document.getElementById("options-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  let questions = [];
  let currentQuestionIndex = 0;

  // Get topic from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic"); // e.g., pointing, single-click

  // Load classes.json
  fetch("../data/classes.json") // adjust path relative to mouse.html
    .then((res) => res.json())
    .then((classes) => {
      // Flatten all topics across years, terms, and categories
      const allTopics = classes.flatMap((year) =>
        year.terms.flatMap((term) =>
          term.categories.flatMap((cat) =>
            cat.topics.map((t) => ({
              ...t,
              category: cat.name,
              year: year.name,
              term: term.title,
            }))
          )
        )
      );

      const topic = allTopics.find((t) => t.title.toLowerCase() === topicName?.toLowerCase());
      if (!topic) {
        questionContainer.innerHTML = `<h2>❌ Topic not found: ${topicName}</h2>`;
        return;
      }

      // Convert topic into question objects for the game
      questions = topic.questions || [
        {
          question: `Practice ${topic.title}`,
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          answer: "Option 1",
        },
      ];

      showQuestion();
    })
    .catch((err) => {
      console.error("Error loading classes.json:", err);
      questionContainer.innerHTML = "<h2>❌ Failed to load topics.</h2>";
    });

  function showQuestion() {
    feedback.textContent = "";
    nextButton.classList.add("hidden");

    const question = questions[currentQuestionIndex];
    questionContainer.innerHTML = `<h2>${question.question}</h2>`;
    optionsContainer.innerHTML = question.options
      .map(
        (opt, index) =>
          `<button class="option-btn" data-index="${index}">${opt}</button>`
      )
      .join("");

    document.querySelectorAll(".option-btn").forEach((btn) =>
      btn.addEventListener("click", selectAnswer)
    );
  }

  function selectAnswer(e) {
    const selectedIndex = e.target.dataset.index;
    const question = questions[currentQuestionIndex];

    if (question.options[selectedIndex] === question.answer) {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Wrong! The correct answer is: ${question.answer}`;
      feedback.style.color = "red";
    }

    document.querySelectorAll(".option-btn").forEach((btn) => (btn.disabled = true));
    nextButton.classList.remove("hidden");
  }

  nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      questionContainer.innerHTML = `<h2>🎉 Well done! You completed all ${topicName} questions.</h2>`;
      optionsContainer.innerHTML = "";
      nextButton.classList.add("hidden");
    }
  });
});
