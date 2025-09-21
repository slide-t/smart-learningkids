// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-btn");

  // Read URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const topicName = urlParams.get("topic") || "Keyboard Practice";

  // Full keyboard exercises mapped by topic
  const keyboardExercises = {
    // ==== YEAR 1–2 ====
    "Home Row Practice": [
      { description: "Type the home row keys: asdf", answer: "asdf" },
      { description: "Type the home row keys: jkl;", answer: "jkl;" },
      { description: "Type both hands: asdf jkl;", answer: "asdf jkl;" }
    ],
    "Type Two-Letter Words": [
      { description: "Type: it", answer: "it" },
      { description: "Type: go", answer: "go" },
      { description: "Type: on", answer: "on" }
    ],
    "Type Three-Letter Words": [
      { description: "Type: cat", answer: "cat" },
      { description: "Type: dog", answer: "dog" },
      { description: "Type: sun", answer: "sun" }
    ],

    // ==== YEAR 3–6 ====
    "Typing Simple Words": [
      { description: "Type: tree", answer: "tree" },
      { description: "Type: book", answer: "book" },
      { description: "Type: fish", answer: "fish" }
    ],
    "Typing Short Sentences": [
      { description: "Type: I can type.", answer: "I can type." },
      { description: "Type: We love books.", answer: "We love books." }
    ],
    "Typing Simple Paragraphs": [
      { description: "Type: The sun is bright. It gives us light and warmth.", answer: "The sun is bright. It gives us light and warmth." }
    ],
    "Typing Short Paragraphs": [
      { description: "Type: My name is John. I love playing football after school with my friends.", answer: "My name is John. I love playing football after school with my friends." }
    ],

    // ==== YEAR 7–9 ====
    "Typing Medium Paragraphs": [
      { description: "Type: Computers help us to learn, play games, and search for information on the internet.", answer: "Computers help us to learn, play games, and search for information on the internet." }
    ],
    "Typing Long Paragraphs": [
      { description: "Type: Education is very important. It helps us to grow, learn new things, and prepare for the future.", answer: "Education is very important. It helps us to grow, learn new things, and prepare for the future." }
    ],
    "Typing Essays": [
      { description: "Type: Technology has changed the world. From communication to learning, everything is easier and faster now.", answer: "Technology has changed the world. From communication to learning, everything is easier and faster now." }
    ],
    "Typing Reports": [
      { description: "Type: The science project showed that plants need sunlight, water, and air to grow well.", answer: "The science project showed that plants need sunlight, water, and air to grow well." }
    ],
    "Typing Research Papers": [
      { description: "Type: Research is important in education. It allows students to find solutions, learn deeply, and share knowledge with others.", answer: "Research is important in education. It allows students to find solutions, learn deeply, and share knowledge with others." }
    ],
    "Typing Projects": [
      { description: "Type: A school project helps students to work together, use creativity, and present their ideas in a clear way.", answer: "A school project helps students to work together, use creativity, and present their ideas in a clear way." }
    ],

    // ==== YEAR 10–12 ====
    "Typing Theses": [
      { description: "Type: A thesis is a long essay or research paper that a student writes to complete their degree program.", answer: "A thesis is a long essay or research paper that a student writes to complete their degree program." }
    ],
    "Typing Dissertations": [
      { description: "Type: A dissertation is more detailed than a thesis and requires years of study and original research.", answer: "A dissertation is more detailed than a thesis and requires years of study and original research." }
    ],
    "Typing Final Projects": [
      { description: "Type: The final year project is the last major assignment that shows everything a student has learned.", answer: "The final year project is the last major assignment that shows everything a student has learned." }
    ]
  };

  let exercises = keyboardExercises[topicName] || [];
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
      <div class="typing-target text-lg font-mono tracking-wide mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300">${exercise.answer}</div>
      <input id="answer-input" type="text" placeholder="Type here..." 
             class="w-full border-2 border-purple-300 rounded-lg p-3 focus:outline-none focus:border-purple-500"/>
    `;

    const input = document.getElementById("answer-input");
    const target = document.querySelector(".typing-target");
    input.focus();

    input.addEventListener("input", () => {
      const typed = input.value;
      let highlighted = "";

      for (let i = 0; i < exercise.answer.length; i++) {
        if (i < typed.length) {
          if (typed[i] === exercise.answer[i]) {
            highlighted += `<span class="text-green-600">${exercise.answer[i]}</span>`;
          } else {
            highlighted += `<span class="text-red-600">${exercise.answer[i]}</span>`;
          }
        } else {
          highlighted += `<span class="text-gray-400">${exercise.answer[i]}</span>`;
        }
      }

      target.innerHTML = highlighted;

      if (typed === exercise.answer) {
        feedback.textContent = "✅ Correct!";
        feedback.className = "mt-4 text-lg font-semibold text-green-600 text-center";
        currentExerciseIndex++;
        setTimeout(showExercise, 1000);
      }
    });
  }

  showExercise();
});
