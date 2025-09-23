// keyboard.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("keyboard-game");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const nextBtn = document.getElementById("nextBtn");
  const homeBtn = document.getElementById("homeBtn");
  const virtualKeyboard = document.getElementById("virtualKeyboard"); // 🔑 optional virtual keyboard

  // Get topic from query string (e.g. keyboard.html?topic=home-row)
  const urlParams = new URLSearchParams(window.location.search);
  const topic = urlParams.get("topic");

  // Game content mapped from classes.json
  const games = {
    "home-row": {
      title: "Home Row Practice",
      instructions: "Practice typing the home row keys: a, s, d, f, j, k, l, ;",
      content: ["a", "s", "d", "f", "j", "k", "l", ";"]
    },
    "two-letter": {
      title: "Type Two-Letter Words",
      instructions: "Type the two-letter words shown.",
      content: ["at", "on", "in", "up", "to", "it"]
    },
    "three-letter": {
      title: "Type Three-Letter Words",
      instructions: "Type the three-letter words shown.",
      content: ["cat", "dog", "sun", "pen", "car"]
    },
    "simple-words": {
      title: "Typing Simple Words",
      instructions: "Type each word correctly.",
      content: ["book", "chair", "table", "plant", "water"]
    },
    "short-sentences": {
      title: "Typing Short Sentences",
      instructions: "Type these short sentences.",
      content: ["I am happy.", "We play ball.", "The cat runs."]
    },
    "simple-paragraphs": {
      title: "Typing Simple Paragraphs",
      instructions: "Type the paragraph as shown.",
      content: [
        "My name is Ada. I love to read books. I go to school every day."
      ]
    },
    "complex-sentences": {
      title: "Typing Complex Sentences",
      instructions: "Type the sentences with commas and connectors.",
      content: [
        "When it rains, we stay indoors.",
        "Although it was late, she finished her homework."
      ]
    },
    "paragraphs": {
      title: "Typing Short Paragraphs",
      instructions: "Type this short paragraph.",
      content: [
        "The sun rises in the east and sets in the west. It gives us light and warmth."
      ]
    },
    "medium-paragraphs": {
      title: "Typing Medium Paragraphs",
      instructions: "Type this medium-length paragraph.",
      content: [
        "Computers are useful machines. They help us to write, learn, and play games. Many people use them at work and in schools."
      ]
    },
    "long-paragraphs": {
      title: "Typing Long Paragraphs",
      instructions: "Type this long paragraph carefully.",
      content: [
        "Education is important for everyone. It gives us knowledge and skills that prepare us for life. Without education, it is difficult to find good jobs or solve everyday problems."
      ]
    },
    "sentences": {
      title: "Typing Sentences",
      instructions: "Type each sentence shown.",
      content: [
        "Typing helps improve computer skills.",
        "We learn faster when we practice daily."
      ]
    },
    "long-sentences": {
      title: "Typing Long Sentences",
      instructions: "Type these long sentences.",
      content: [
        "She was excited to visit the museum, which had many interesting exhibits about history and science."
      ]
    },
    "essays": {
      title: "Typing Essays",
      instructions: "Type this short essay.",
      content: [
        "Technology has changed the world. Computers, phones, and the internet make communication and learning faster. However, we must use them wisely."
      ]
    },
    "medium-essays": {
      title: "Typing Medium Essays",
      instructions: "Type this medium essay.",
      content: [
        "Healthy living is important. Eating good food, exercising daily, and sleeping well help us stay strong. Students should learn how to balance study and rest."
      ]
    },
    "long-essays": {
      title: "Typing Long Essays",
      instructions: "Type this long essay.",
      content: [
        "Our environment is precious. Clean air, water, and land are essential for life. Sadly, pollution is destroying nature. We must recycle, plant trees, and reduce waste to protect our planet for future generations."
      ]
    },
    "reports": {
      title: "Typing Reports",
      instructions: "Type this report.",
      content: [
        "Report on School Library: The library has 500 books including storybooks and science books. It opens at 8 am and closes at 4 pm. Students are encouraged to borrow books weekly."
      ]
    },
    "research": {
      title: "Typing Research Papers",
      instructions: "Type this research paper excerpt.",
      content: [
        "Research shows that children who read daily perform better in school. They have stronger vocabulary and better writing skills compared to those who do not read regularly."
      ]
    },
    "projects": {
      title: "Typing Projects",
      instructions: "Type this project write-up.",
      content: [
        "Science Project: We built a water filter using sand, gravel, and charcoal. The filter cleaned dirty water and made it clear. This project taught us how to make safe drinking water."
      ]
    },
    "theses": {
      title: "Typing Theses",
      instructions: "Type this thesis excerpt.",
      content: [
        "This thesis studies the effects of technology in education. It examines how digital tools influence student learning and teacher instruction in modern classrooms."
      ]
    },
    "dissertations": {
      title: "Typing Dissertations",
      instructions: "Type this dissertation excerpt.",
      content: [
        "This dissertation explores climate change impacts on agriculture. Data collected from 20 communities shows that rainfall patterns affect food production significantly."
      ]
    },
    "final-projects": {
      title: "Typing Final Projects",
      instructions: "Type this final project excerpt.",
      content: [
        "Final Project: Developing a community app for waste recycling. The app allows households to schedule pickups and track recycling activities."
      ]
    }
  };

  // Function to initialize the game
  function initGame(game) {
    container.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">${game.title}</h2>
      <p class="mb-4">${game.instructions}</p>
      <div id="game-content" class="p-4 border rounded bg-gray-100">
        <p id="prompt" class="text-lg font-mono"></p>
        <input id="typing-input" class="mt-2 p-2 border rounded w-full" placeholder="Start typing here..." />
        <p id="feedback" class="mt-2 text-sm"></p>
      </div>
    `;

    let index = 0;
    const promptEl = document.getElementById("prompt");
    const inputEl = document.getElementById("typing-input");
    const feedbackEl = document.getElementById("feedback");

    function loadPrompt() {
      if (index < game.content.length) {
        promptEl.textContent = game.content[index];
        inputEl.value = "";
        feedbackEl.textContent = "";
      } else {
        promptEl.textContent = "🎉 Well done! You finished this topic.";
        inputEl.disabled = true;
      }
    }

    function checkInput() {
      if (inputEl.value === game.content[index]) {
        feedbackEl.textContent = "✅ Correct!";
        feedbackEl.className = "text-green-600 mt-2 text-sm";
        index++;
        setTimeout(loadPrompt, 800);
      } else {
        feedbackEl.textContent = "⏳ Keep typing...";
        feedbackEl.className = "text-blue-600 mt-2 text-sm";
      }
    }

    inputEl.addEventListener("input", checkInput);

    // Virtual keyboard clicks
    if (virtualKeyboard) {
      virtualKeyboard.addEventListener("click", (e) => {
        if (e.target.classList.contains("key")) {
          const key = e.target.textContent;
          inputEl.value += key;
          highlightKey(e.target);
          checkInput();
        }
      });
    }

    // Real keyboard key highlight
    document.addEventListener("keydown", (e) => {
      const keyEl = document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
      if (keyEl) {
        highlightKey(keyEl);
      }
    });

    function highlightKey(el) {
      el.classList.add("bg-yellow-300");
      setTimeout(() => el.classList.remove("bg-yellow-300"), 300);
    }

    loadPrompt();
  }

  // Buttons
  if (startBtn && topic && games[topic]) {
    startBtn.addEventListener("click", () => {
      startBtn.classList.add("hidden");
      initGame(games[topic]);
    });
  } else if (!games[topic]) {
    container.innerHTML = `<p class="text-red-600">❌ Invalid topic. Please go back and select again.</p>`;
  }

  if (restartBtn) restartBtn.addEventListener("click", () => location.reload());
  if (homeBtn) homeBtn.addEventListener("click", () => window.location.href = "index.html");
  if (nextBtn) nextBtn.addEventListener("click", () => {
    console.log("Next clicked (extend this later)");
  });
});
