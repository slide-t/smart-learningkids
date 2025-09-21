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
  const virtualKeyboard = document.getElementById('virtual-keyboard');

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

  // Find topic from URL params (class, term, topic) or pick first keyboard topic
  function initFromURL() {
    const classId = qs('class');
    const termNum = qs('term') ? Number(qs('term')) : null;
    const topicParam = qs('topic');

    // search
    let found = null;
    if (classId && data) {
      const year = data.find(y => y.id === classId || normalize(y.name) === normalize(classId));
      if (year) {
        const term = (year.terms || []).find(t => (termNum ? t.number === termNum : true));
        if (term) {
          // pick keyboard category first
          const keyboardCat = (term.categories || []).find(c => c.id === 'keyboard' || normalize(c.name).includes('keyboard'));
          if (keyboardCat) {
            // find topic by topicParam (normalized) else pick first
            if (topicParam) {
              const t = (keyboardCat.topics || []).find(topic => normalize(topic.title) === normalize(topicParam));
              if (t) found = t;
            }
            if (!found) found = (keyboardCat.topics || [])[0];
          }
        }
      }
    }

    // fallback: search across all years if not found
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

    // final fallback: first keyboard topic in data
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
    // prepare exercises array from topicObj.items
    exercises = Array.isArray(topicObj.items) ? topicObj.items.slice() : [];
    // Normalize exercises to strings
    exercises = exercises.map(it => String(it));
  }

  // Start
  function startPractice() {
    // reset stats
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
    setupVirtualKeyboardIfNeeded();
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

  // Show current exercise
  function showExercise() {
    feedback.textContent = '';
    nextBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    backBtn.classList.add('hidden');
    homeBtn.classList.add('hidden');

    if (exerciseIndex >= exercises.length) {
      // finished
      fallingItem.textContent = '';
      feedback.innerHTML = `<span class="text-green-600 font-bold">🎉 Congratulations — you completed "${topicObj.title}"</span>`;
      nextBtn.textContent = 'Next';
      nextBtn.classList.remove('hidden');
      restartBtn.classList.remove('hidden');
      backBtn.classList.remove('hidden');
      homeBtn.classList.remove('hidden');
      return;
    }

    // current target — pick item and animate falling
    const item = exercises[exerciseIndex];
    animateFalling(item);
    // clear input
    textInput.value = '';
    textInput.focus();
  }

  // Falling animation (simple): place item at top with random x and animate down
  function animateFalling(text) {
    // style fallingItem
    fallingItem.textContent = text;
    fallingItem.style.position = 'absolute';
    fallingItem.style.top = '-40px';
    // random left within stage width
    const stageRect = fallingStage.getBoundingClientRect();
    const minX = 10;
    const maxX = Math.max(10, stageRect.width - 100);
    const left = Math.floor(Math.random() * (maxX - minX)) + minX;
    fallingItem.style.left = `${left}px`;
    fallingItem.style.transition = 'transform 1.2s ease-in, top 1.2s linear';
    // reset any transform
    fallingItem.style.transform = 'translateY(0)';
    // force reflow then animate to bottom
    requestAnimationFrame(() => {
      fallingItem.style.top = `${stageRect.height - 60}px`;
      // slight scale/color effect
      fallingItem.style.transform = 'scale(1.05)';
      setTimeout(() => {
        fallingItem.style.transform = 'scale(1)';
      }, 1200);
    });
  }

  // Handle user input (physical keyboard or input box)
  function checkInput() {
    const expected = exercises[exerciseIndex] ? String(exercises[exerciseIndex]).trim() : '';
    const got = textInput.value.trim();
    if (!expected) return;

    // for simple comparison, ignore multiple spaces and case for words/sentences
    if (normalize(got) === normalize(expected)) {
      correct++;
      feedback.textContent = `✅ Correct: ${expected}`;
      feedback.style.color = 'green';
      exerciseIndex++;
      updateScore();
      // small delay then show next
      setTimeout(showExercise, 700);
    } else {
      // if entered but incorrect (we wait for ENTER or exact match)
      // we'll detect Enter key in input handler to mark wrong and move on.
    }
  }

  // Enter key behavior: if Enter pressed, evaluate and proceed (mark wrong if not exact)
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

  // Update score UI
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

  // Next button: if you want to link to next topic, you could compute it from the classes JSON;
  // for now Next will simply restart the same topic or navigate back (you can extend)
  nextBtn.addEventListener('click', () => {
    // attempt to find next keyboard topic in data and navigate there (if available)
    if (!data || !topicObj) {
      // simply restart
      exerciseIndex = 0;
      correct = 0; wrong = 0;
      updateScore();
      showExercise();
      return;
    }

    // search for current topic position in data and move to next keyboard topic
    let foundNext = null;
    outer:
    for (const y of data) {
      for (const t of (y.terms || [])) {
        for (const c of (t.categories || [])) {
          for (const top of (c.topics || [])) {
            if (top.title === topicObj.title) {
              // find next topic in same category
              const idx = (c.topics || []).indexOf(top);
              if (idx >= 0 && idx < (c.topics || []).length - 1) {
                foundNext = c.topics[idx + 1];
                break outer;
              } else {
                // try finding next category topic...
                // fall back to first keyboard topic in next term/year (simplified)
              }
            }
          }
        }
      }
    }

    if (foundNext) {
      // navigate to that topic (reload page with new topic param)
      const newTopic = encodeURIComponent(foundNext.title);
      location.search = updateQueryStringParameter(location.search, 'topic', newTopic);
    } else {
      // no next found — restart same
      exerciseIndex = 0;
      correct = 0; wrong = 0;
      updateScore();
      showExercise();
    }
  });

  // Restart
  restartBtn.addEventListener('click', () => {
    exerciseIndex = 0;
    correct = 0; wrong = 0;
    updateScore();
    showExercise();
  });

  // Helper to update query param
  function updateQueryStringParameter(qs, key, value) {
    const params = new URLSearchParams(qs);
    params.set(key, value);
    return '?' + params.toString();
  }

  // Virtual keyboard (simple)
  function setupVirtualKeyboardIfNeeded() {
    if (!virtualKeyboard) return;
    if (window.innerWidth >= 768) {
      virtualKeyboard.classList.add('hidden');
      return;
    }
    virtualKeyboard.classList.remove('hidden');
    virtualKeyboard.innerHTML = '';
    const keys = "QWERTYUIOP ASDFGHJKL ZXCVBNM".split(' ');
    keys.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'flex justify-center gap-2 mb-2';
      row.split('').forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'px-3 py-2 bg-indigo-100 rounded';
        btn.textContent = ch;
        btn.addEventListener('click', () => {
          // append char to input
          textInput.value += ch.toLowerCase();
          textInput.focus();
        });
        rowDiv.appendChild(btn);
      });
      virtualKeyboard.appendChild(rowDiv);
    });
    // space and enter
    const ctrlRow = document.createElement('div');
    ctrlRow.className = 'flex justify-center gap-2';
    const space = document.createElement('button');
    space.className = 'px-6 py-2 bg-indigo-100 rounded';
    space.textContent = 'Space';
    space.addEventListener('click', () => { textInput.value += ' '; textInput.focus(); });
    const enter = document.createElement('button');
    enter.className = 'px-4 py-2 bg-indigo-100 rounded';
    enter.textContent = 'Enter';
    enter.addEventListener('click', () => {
      const evt = new KeyboardEvent('keydown', {key:'Enter'});
      textInput.dispatchEvent(evt);
    });
    ctrlRow.appendChild(space);
    ctrlRow.appendChild(enter);
    virtualKeyboard.appendChild(ctrlRow);
  }

  // Start button hook
  startBtn.addEventListener('click', () => {
    startPractice();
    // hide start to avoid accidental double starts
    startBtn.classList.add('hidden');
  });

  // Also support pressing Space to start when on splash
  document.addEventListener('keydown', (e) => {
    if (!gameArea.classList.contains('hidden') || !splash.classList.contains('hidden')) {
      // If splash visible and user hits Space or Enter -> start
      if (!splash.classList.contains('hidden') && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        startBtn.click();
      }
    }
  });

  // Load and init
  loadJSON();

})();
