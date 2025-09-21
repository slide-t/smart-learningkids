// keyboard.js
(() => {
  // DOM
  const startBtn = document.getElementById('start-btn');
  const splash = document.getElementById('splash');
  const gameArea = document.getElementById('game-area');
  const topicTitle = document.getElementById('topic-title');
  const topicDesc = document.getElementById('topic-desc');
  const fallingStage = document.getElementById('falling-stage');
  const fallingItem = document.getElementById('falling-item');
  const textInput = document.getElementById('text-input');
  const feedback = document.getElementById('feedback');
  const timerEl = document.getElementById('timer');
  const accuracyEl = document.getElementById('accuracy');
  const correctEl = document.getElementById('correct');
  const wrongEl = document.getElementById('wrong');
  const nextBtn = document.getElementById('next-btn');
  const restartBtn = document.getElementById('restart-btn');
  const backBtn = document.getElementById('back-classes');
  const homeBtn = document.getElementById('home-btn');

  // Config
  let data = null;
  let topicObj = null;
  let exercises = [];
  let exerciseIndex = 0;
  let correct = 0, wrong = 0;
  let timer = 420; // seconds
  let timerInterval = null;

  // Utils
  const qs = (name) => new URLSearchParams(location.search).get(name);
  const normalize = s => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');

  // Prevent mobile soft keyboard (only allow physical keyboards)
  if (textInput) {
    textInput.setAttribute("readonly", "readonly"); // block mobile typing
    textInput.addEventListener("focus", () => {
      // Remove readonly only if physical keyboard detected
      textInput.removeAttribute("readonly");
    });
  }

  // Load JSON
  async function loadJSON() {
    try {
      const res = await fetch('keyboard.json');
      if (!res.ok) throw new Error('Failed to load keyboard.json');
      data = await res.json();
      initFromURL();
    } catch (err) {
      console.error(err);
      topicTitle.textContent = 'Error loading data';
      topicDesc.textContent = '';
    }
  }

  // Find topic from URL params (class, term, topic)
  function initFromURL() {
    const classId = qs('class');
    const termNum = qs('term') ? Number(qs('term')) : null;
    const topicParam = qs('topic');

    let found = null;
    if (classId && data) {
      const year = data.find(y => y.id === classId || normalize(y.name) === normalize(classId));
      if (year) {
        const term = (year.terms || []).find(t => (termNum ? t.number === termNum : true));
        if (term) {
          const keyboardCat = (term.categories || []).find(c => c.id === 'keyboard' || normalize(c.name).includes('keyboard'));
          if (keyboardCat) {
            if (topicParam) {
              const t = (keyboardCat.topics || []).find(topic => normalize(topic.title) === normalize(topicParam));
              if (t) found = t;
            }
            if (!found) found = (keyboardCat.topics || [])[0];
          }
        }
      }
    }

    // fallback search
    if (!found && topicParam) {
      for (const y of data) {
        for (const t of (y.terms || [])) {
          for (const c of (t.categories || [])) {
            for (const top of (c.topics || [])) {
              if (normalize(top.title) === normalize(topicParam)) {
                found = top;
                break;
              }
            }
            if (found) break;
          }
          if (found) break;
        }
        if (found) break;
      }
    }

    // final fallback
    if (!found) {
      outer:
      for (const y of data) {
        for (const t of (y.terms || [])) {
          const kc = (t.categories || []).find(c => c.id === 'keyboard' || normalize(c.name).includes('keyboard'));
          if (kc && kc.topics && kc.topics.length) {
            found = kc.topics[0];
            break outer;
          }
        }
      }
    }

    topicObj = found;
    if (!topicObj) {
      topicTitle.textContent = 'No keyboard topic found';
      return;
    }

    topicTitle.textContent = topicObj.title || 'Keyboard Practice';
    topicDesc.textContent = topicObj.description || '';
    exercises = Array.isArray(topicObj.items) ? topicObj.items.slice() : [];
    exercises = exercises.map(it => String(it));
  }

  // Start
  function startPractice() {
    exerciseIndex = 0;
    correct = 0;
    wrong = 0;
    updateScore();
    splash.classList.add('hidden');
    gameArea.classList.remove('hidden');
    textInput.value = '';
    textInput.focus();
    startTimer();
    showExercise();
  }

  // Timer
  function startTimer() {
    clearInterval(timerInterval);
    timer = 420;
    updateTimer();
    timerInterval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(timerInterval);
        feedback.textContent = '⏰ Time’s up!';
        feedback.style.color = 'red';
        endPractice();
      }
      updateTimer();
    }, 1000);
  }
  function updateTimer() {
    const m = String(Math.floor(timer/60)).padStart(2,'0');
    const s = String(timer%60).padStart(2,'0');
    timerEl.textContent = `${m}:${s}`;
  }

  // Show exercise
  function showExercise() {
    feedback.textContent = '';
    nextBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    backBtn.classList.add('hidden');
    homeBtn.classList.add('hidden');

    if (exerciseIndex >= exercises.length) {
      fallingItem.textContent = '';
      feedback.innerHTML = `<span class="text-green-600 font-bold">🎉 Congratulations — you completed "${topicObj.title}"</span>`;
      nextBtn.textContent = 'Next';
      nextBtn.classList.remove('hidden');
      restartBtn.classList.remove('hidden');
      backBtn.classList.remove('hidden');
      homeBtn.classList.remove('hidden');
      return;
    }

    const item = exercises[exerciseIndex];
    animateFalling(item);
    textInput.value = '';
    textInput.focus();
  }

  // Falling animation
  function animateFalling(text) {
    fallingItem.textContent = text;
    fallingItem.style.position = 'absolute';
    fallingItem.style.top = '-40px';
    const stageRect = fallingStage.getBoundingClientRect();
    const minX = 10;
    const maxX = Math.max(10, stageRect.width - 100);
    const left = Math.floor(Math.random() * (maxX - minX)) + minX;
    fallingItem.style.left = `${left}px`;
    fallingItem.style.transition = 'transform 1.2s ease-in, top 1.2s linear';
    fallingItem.style.transform = 'translateY(0)';
    requestAnimationFrame(() => {
      fallingItem.style.top = `${stageRect.height - 60}px`;
      fallingItem.style.transform = 'scale(1.05)';
      setTimeout(() => {
        fallingItem.style.transform = 'scale(1)';
      }, 1200);
    });
  }

  // Input checking
  function checkInput() {
    const expected = exercises[exerciseIndex] ? String(exercises[exerciseIndex]).trim() : '';
    const got = textInput.value.trim();
    if (!expected) return;
    if (normalize(got) === normalize(expected)) {
      correct++;
      feedback.textContent = `✅ Correct: ${expected}`;
      feedback.style.color = 'green';
      exerciseIndex++;
      updateScore();
      setTimeout(showExercise, 700);
    }
  }

  // Enter key handling
  textInput && textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const expected = exercises[exerciseIndex] ? String(exercises[exerciseIndex]).trim() : '';
      const got = textInput.value.trim();
      if (normalize(got) === normalize(expected)) {
        correct++;
        feedback.textContent = `✅ Correct: ${expected}`;
        feedback.style.color = 'green';
      } else {
        wrong++;
        feedback.textContent = `❌ Wrong — expected: ${expected}`;
        feedback.style.color = 'red';
      }
      updateScore();
      exerciseIndex++;
      setTimeout(showExercise, 700);
    }
  });

  // Score update
  function updateScore() {
    correctEl.textContent = correct;
    wrongEl.textContent = wrong;
    const total = correct + wrong;
    accuracyEl.textContent = total ? Math.round((correct/total)*100) + '%' : '0%';
  }

  // End practice
  function endPractice() {
    clearInterval(timerInterval);
    restartBtn.classList.remove('hidden');
    backBtn.classList.remove('hidden');
    homeBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    feedback.textContent = 'Practice ended. Use Restart or Back to Classes.';
  }

  // Restart
  restartBtn.addEventListener('click', () => {
    exerciseIndex = 0;
    correct = 0; wrong = 0;
    updateScore();
    showExercise();
  });

  // Start button
  startBtn.addEventListener('click', () => {
    startPractice();
    startBtn.classList.add('hidden');
  });

  // Load JSON
  loadJSON();

})();
