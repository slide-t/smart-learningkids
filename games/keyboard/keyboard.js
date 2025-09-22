// keyboard.js — Canvas-based interactive typing game engine
// Expects: keyboard.html (your provided HTML) and keyboard.json (your provided JSON)
// Hooks used in keyboard.html:
//  - #topics-container
//  - #game-container
//  - #lesson-title
//  - #lesson-instructions
//  - #game-content (will host the Canvas)
//  - #prompt, #typing-input (we keep an input for accessibility but main input is keyboard events)
//  - #feedback, #score-display, #progress-display
//  - #restart-btn, #back-btn (existing in HTML). We'll create Next & Home buttons dynamically.
//
// Author: ChatGPT
(() => {
  const JSON_PATH = 'keyboard.json';
  const DROP_TIME_MS = 3000; // default time for an item to reach the bottom in ms (≈3s)
  const FALL_INTERVAL_MS = 700; // spawn new falling item interval (ms) for keys stage
  const MAX_WORDS_PER_LEVEL = 12; // number of words for generated word levels

  // DOM refs
  const topicsContainer = document.getElementById('topics-container');
  const gameContainer = document.getElementById('game-container');
  const lessonTitle = document.getElementById('lesson-title');
  const lessonInstructions = document.getElementById('lesson-instructions');
  const gameContent = document.getElementById('game-content');
  const promptEl = document.getElementById('prompt');
  const typingInput = document.getElementById('typing-input');
  const feedbackEl = document.getElementById('feedback');
  const scoreDisplay = document.getElementById('score-display');
  const progressDisplay = document.getElementById('progress-display');
  const restartBtn = document.getElementById('restart-btn');
  const backBtn = document.getElementById('back-btn');

  // dynamic Next & Home buttons (we'll inject)
  let nextBtn = null;
  let homeBtn = null;

  // data & state
  let rawData = [];
  let flatTopics = []; // flattened topics for easy listing
  let canvas, ctx, canvasWidth, canvasHeight;
  let animationId = null;

  const Engine = {
    entry: null,         // selected topic entry object (flatTopics item)
    levelQueue: [],      // list of levels to run for the selected topic; each level = {type:'keys'|'words', items:[], label:''}
    activeLevelIndex: 0, // index in levelQueue
    falling: [],         // list of current falling items on canvas
    spawnTimer: null,    // interval for spawning
    spawnIndex: 0,       // how many spawned in current level
    score: 0,
    misses: 0,
    startTime: 0,
    totalItemsThisLevel: 0
  };

  // Helpers
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

  // Flatten JSON into list of topic entries for display
  function flatten(data) {
    const out = [];
    (data || []).forEach(year => {
      const yId = year.id || year.name || 'year';
      const yName = year.name || yId;
      (year.terms || []).forEach(term => {
        const tNum = term.number || 0;
        const tTitle = term.title || `Term ${tNum}`;
        (term.categories || []).forEach(category => {
          const cId = category.id || category.name || 'cat';
          const cName = category.name || cId;
          (category.topics || []).forEach((topic, idx) => {
            out.push({
              yearId: yId,
              yearName: yName,
              termNumber: tNum,
              termTitle: tTitle,
              categoryId: cId,
              categoryName: cName,
              topicIndex: idx,
              topic: topic
            });
          });
        });
      });
    });
    return out;
  }

  // Load JSON and render topic cards
  async function init() {
    try {
      const res = await fetch(JSON_PATH, {cache: 'no-store'});
      if (!res.ok) throw new Error('Could not load keyboard.json');
      rawData = await res.json();
      flatTopics = flatten(rawData);
      renderTopicCards();
    } catch (err) {
      console.error(err);
      topicsContainer.innerHTML = `<div class="text-red-600">Error loading keyboard.json — see console</div>`;
    }
  }

  function renderTopicCards() {
    topicsContainer.innerHTML = '';
    flatTopics.forEach((entry, i) => {
      // Only show keyboard category topics
      if ((entry.categoryId || '').toLowerCase() !== 'keyboard' && (entry.categoryName || '').toLowerCase() !== 'keyboard skills' && (entry.categoryName || '').toLowerCase() !== 'keyboard') {
        // still allow keyboard topics with id 'keyboard' — but show all for now
      }
      const btn = document.createElement('button');
      btn.className = 'text-left p-4 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col gap-1';
      btn.style.cursor = 'pointer';
      btn.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm text-gray-500">${escapeHtml(entry.yearName)} · ${escapeHtml(entry.termTitle)} · ${escapeHtml(entry.categoryName)}</div>
            <div class="font-semibold text-md mt-1">${escapeHtml(entry.topic.title)}</div>
          </div>
          <div class="text-xs text-gray-400">${escapeHtml(entry.topic.type || 'practice')}</div>
        </div>
        <div class="text-sm text-gray-600 mt-2">${escapeHtml(entry.topic.description || '')}</div>
      `;
      btn.addEventListener('click', () => beginTopic(entry));
      topicsContainer.appendChild(btn);
    });
  }

  // Begin a topic: prepare the level queue (keys, then generated 2-letter and 3-letter word levels)
  function beginTopic(entry) {
    Engine.entry = entry;
    Engine.score = 0; Engine.misses = 0;
    Engine.levelQueue = [];
    Engine.activeLevelIndex = 0;

    // If topic.type is 'keys' or similar and has items, make a keys-level
    const ttype = (entry.topic.type || '').toLowerCase();
    if (ttype === 'keys' || ttype === 'home_row_drill' || ttype === 'sequence') {
      // first level: single keys from items
      const keys = (entry.topic.items || []).map(String).filter(Boolean);
      if (keys.length) {
        Engine.levelQueue.push({type: 'keys', items: keys.slice(), label: entry.topic.title || 'Keys'});
        // automatically add generated words levels from these letters
        const letters = keys.map(k => k.trim()).filter(Boolean).map(s => s.replace(/\s+/g,'')).filter(s => s.length===1);
        const uniqueLetters = Array.from(new Set(letters));
        if (uniqueLetters.length >= 2) {
          Engine.levelQueue.push({type: 'words', items: generateWords(uniqueLetters, 2, MAX_WORDS_PER_LEVEL), label: 'Two-letter words'});
          Engine.levelQueue.push({type: 'words', items: generateWords(uniqueLetters, 3, MAX_WORDS_PER_LEVEL), label: 'Three-letter words'});
        }
      } else {
        // fallback: treat topic.items as generic words
        Engine.levelQueue.push({type: 'words', items: (entry.topic.items || []).slice(), label: entry.topic.title});
      }
    } else if (ttype === 'words' || ttype === 'sentences' || ttype === 'paragraphs' || ttype === 'timed' || ttype === 'special') {
      Engine.levelQueue.push({type: (ttype==='words' ? 'words' : 'words'), items: (entry.topic.items || []).slice(), label: entry.topic.title});
    } else {
      // default fallback
      Engine.levelQueue.push({type: 'words', items: (entry.topic.items || []).slice(), label: entry.topic.title});
    }

    // Show game UI
    lessonTitle.textContent = entry.topic.title;
    lessonInstructions.textContent = entry.topic.description || '';
    feedbackEl.textContent = '';
    scoreDisplay.textContent = `Score: 0`;
    progressDisplay.textContent = `0 / ${Engine.levelQueue[0].items.length || 0}`;
    showGameUI();

    // create canvas inside gameContent and start first level
    setupCanvas();
    startLevel(0);
    // ensure input focus and keyboard listening
    typingInput.value = '';
    typingInput.placeholder = 'Type on your keyboard (we listen globally)';
    typingInput.focus();
  }

  // Generate random words of length `len` from `letters` (letters = array of 1-char strings)
  function generateWords(letters, len, count) {
    const words = [];
    const L = letters.length;
    function pick() { return letters[Math.floor(Math.random()*L)]; }
    while (words.length < count) {
      let w = '';
      for (let i=0;i<len;i++) w += pick();
      if (!words.includes(w)) words.push(w);
    }
    return words;
  }

  // Show/Hide game container
  function showGameUI() {
    gameContainer.classList.remove('hidden');
    topicsContainer.parentElement.scrollIntoView({behavior:'smooth'});
  }

  function hideGameUI() {
    gameContainer.classList.add('hidden');
    teardownCanvas();
  }

  // Canvas setup & teardown
  function setupCanvas() {
    // clear existing canvas if any
    teardownCanvas();
    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '260px';
    canvas.width = Math.floor(gameContent.clientWidth * devicePixelRatio);
    canvas.height = Math.floor(260 * devicePixelRatio);
    canvas.style.display = 'block';
    canvas.style.background = 'linear-gradient(180deg,#f8fafc, #eef2ff)';
    canvas.style.borderRadius = '8px';
    canvas.style.marginBottom = '8px';
    ctx = canvas.getContext('2d');
    // scale for high DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);
    gameContent.innerHTML = ''; // clear prompt area
    gameContent.appendChild(canvas);
    // overlay top-left info? we will draw in canvas
    canvasWidth = gameContent.clientWidth;
    canvasHeight = 260;
    // attach keyboard listener
    window.addEventListener('keydown', onKeyDownGame);
    // also prevent arrow keys from scrolling page while playing
    window.addEventListener('keydown', preventArrows, {passive:false});
  }

  function teardownCanvas() {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (Engine.spawnTimer) { clearInterval(Engine.spawnTimer); Engine.spawnTimer = null; }
    if (canvas && canvas.parentElement) { canvas.parentElement.removeChild(canvas); }
    window.removeEventListener('keydown', onKeyDownGame);
    window.removeEventListener('keydown', preventArrows);
    Engine.falling = [];
    canvas = null; ctx = null;
  }

  function preventArrows(e) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      e.preventDefault();
    }
  }

  // Start a level in the Engine.levelQueue
  function startLevel(levelIndex) {
    if (!Engine.levelQueue[levelIndex]) { finishTopic(); return; }
    Engine.activeLevelIndex = levelIndex;
    Engine.falling = [];
    Engine.spawnIndex = 0;
    Engine.startTime = Date.now();
    Engine.totalItemsThisLevel = Engine.levelQueue[levelIndex].items.length;
    feedbackEl.textContent = `${Engine.levelQueue[levelIndex].label} — Type the falling ${Engine.levelQueue[levelIndex].type === 'keys' ? 'keys' : 'words'}`;
    progressDisplay.textContent = `0 / ${Engine.totalItemsThisLevel}`;
    // spawn schedule:
    if (Engine.levelQueue[levelIndex].type === 'keys') {
      // spawn at a faster interval, one per FALL_INTERVAL_MS
      Engine.spawnIndex = 0;
      // clear previous timer
      if (Engine.spawnTimer) clearInterval(Engine.spawnTimer);
      Engine.spawnTimer = setInterval(() => {
        if (Engine.spawnIndex >= Engine.totalItemsThisLevel) {
          clearInterval(Engine.spawnTimer); Engine.spawnTimer = null;
          return;
        }
        spawnFallingItem(Engine.levelQueue[levelIndex].items[Engine.spawnIndex]);
        Engine.spawnIndex++;
      }, FALL_INTERVAL_MS);
    } else {
      // for words: spawn fewer at once (we'll evenly spawn until all)
      if (Engine.spawnTimer) clearInterval(Engine.spawnTimer);
      Engine.spawnIndex = 0;
      Engine.spawnTimer = setInterval(() => {
        if (Engine.spawnIndex >= Engine.totalItemsThisLevel) {
          clearInterval(Engine.spawnTimer); Engine.spawnTimer = null;
          return;
        }
        spawnFallingItem(Engine.levelQueue[levelIndex].items[Engine.spawnIndex]);
        Engine.spawnIndex++;
      }, Math.max(600, Math.floor(DROP_TIME_MS/2)));
    }
    // start animation loop
    animationLoop();
  }

  // Spawn a single falling item with physics so it reaches bottom in DROP_TIME_MS
  let _uid = 0;
  function spawnFallingItem(text) {
    if (!canvas) return;
    const textStr = String(text);
    // choose random x within canvas
    const padding = 24;
    const x = Math.floor(Math.random() * (canvasWidth - padding*2)) + padding;
    const startY = -20;
    const endY = canvasHeight - 40;
    const totalMs = DROP_TIME_MS;
    const speed = (endY - startY) / (totalMs / 16); // pixels per frame approx
    const createdAt = Date.now();
    const item = {
      id: ++_uid,
      text: textStr,
      x,
      y: startY,
      speed, // per frame estimate (not perfect but ok)
      createdAt,
      deadline: createdAt + totalMs,
      width: measureTextWidth(textStr) + 14,
      matched: false // whether user typed it successfully
    };
    Engine.falling.push(item);
  }

  // measure text width for canvas layout (approximate using temporary ctx)
  function measureTextWidth(t) {
    if (!ctx) return 40;
    ctx.save();
    ctx.font = '18px monospace';
    const w = ctx.measureText(t).width;
    ctx.restore();
    return Math.ceil(w);
  }

  // animation loop
  function animationLoop() {
    if (!ctx || !canvas) return;
    const nowTs = Date.now();
    // update positions based on time fraction to make speed consistent
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    // background grid or decoration
    drawBackground();

    // update items
    for (let i = Engine.falling.length - 1; i >= 0; i--) {
      const it = Engine.falling[i];
      // progress fraction
      const frac = clamp((nowTs - it.createdAt) / (it.deadline - it.createdAt), 0, 1);
      it.y = -20 + frac * (canvasHeight - 60);
      // draw the item (box + text)
      drawFallingItem(it);
      // check deadline: if reached bottom and not matched => miss
      if (nowTs >= it.deadline && !it.matched) {
        // count as missed and remove
        Engine.misses++;
        // remove item
        Engine.falling.splice(i,1);
        // update progress
        updateProgressUIOnMissOrHit();
      } else if (it.matched) {
        // fade out matched items
        Engine.falling.splice(i,1);
        updateProgressUIOnMissOrHit(true);
      }
    }

    // draw HUD: score, misses, level label
    drawHUD();

    // if no active spawn timer and no falling items, level finished
    if (!Engine.spawnTimer && Engine.falling.length === 0) {
      // small delay then move to next level
      setTimeout(() => {
        // advance to next level
        Engine.activeLevelIndex++;
        if (Engine.activeLevelIndex < Engine.levelQueue.length) {
          startLevel(Engine.activeLevelIndex);
        } else {
          finishTopic();
        }
      }, 650);
      return; // stop animation for now (will be restarted by next level)
    }

    animationId = requestAnimationFrame(animationLoop);
  }

  function drawBackground() {
    // gentle gradient already set; add subtle lines
    ctx.save();
    const h = canvasHeight;
    const w = canvasWidth;
    // top banner
    ctx.fillStyle = '#0ea5e9'; // azure-500
    ctx.globalAlpha = 0.04;
    ctx.fillRect(0,0,w,40);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFallingItem(it) {
    ctx.save();
    // box style
    const boxW = it.width;
    const boxH = 34;
    const x = it.x;
    const y = it.y;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y + 8, boxW, boxH);
    // main box
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#e6edf6';
    roundRect(ctx, x, y, boxW, boxH, 6, true, true);
    // text
    ctx.fillStyle = '#111827';
    ctx.font = '18px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.text, x + 8, y + boxH/2);
    ctx.restore();
  }

  // small rounded rect helper
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) { ctx.strokeStyle = '#e2e8f0'; ctx.stroke(); }
  }

  function drawHUD() {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'top';
    // score
    ctx.fillText(`Score: ${Engine.score}`, 10, 8);
    // misses
    ctx.fillText(`Misses: ${Engine.misses}`, 120, 8);
    // level label
    const lvl = Engine.levelQueue[Engine.activeLevelIndex];
    ctx.fillText(`${lvl ? lvl.label : ''}`, canvasWidth - 160, 8);
    ctx.restore();
  }

  // keyboard input handling in game
  function onKeyDownGame(e) {
    // ignore modifier-only keys
    if (e.key.length > 1 && ![';', ',', '.', '/', "'", '[',']','\\'].includes(e.key)) {
      // allow ; , . / ' [] \ as single keys too
      // but ignore Shift, Control, Alt, Meta
      if (['Shift','Control','Alt','Meta','CapsLock','Tab','Escape'].includes(e.key)) return;
    }
    // normalize pressed key for matching: if key is ' ' treat as space
    let pressed = e.key;
    if (pressed === ' ') pressed = ' ';
    // For uppercase letters: key gives lower-case for letters if no shift? to be safe:
    pressed = String(pressed);
    // Compare against falling items: match exact string
    // To support single-char vs word matching, we match entire item text.
    // For words we expect the user to type the full word — so hitting word first letter won't remove it.
    // Instead we also allow matching if the user types full word in quick succession using typingInput (Enter) — but we focus on key-press mechanic here.
    let matchedAny = false;
    for (let i = Engine.falling.length - 1; i >= 0; i--) {
      const it = Engine.falling[i];
      // If the falling item is a single character, match a direct keypress
      if (it.text.length === 1) {
        // Special note: some characters like ';' may yield 'Semicolon' in some layouts? e.key returns ';' in typical browsers.
        if (pressed === it.text) {
          it.matched = true;
          Engine.score += 1;
          matchedAny = true;
          break;
        }
        // also try lowercase compare
        if (pressed.toLowerCase() === it.text.toLowerCase()) {
          it.matched = true;
          Engine.score += 1;
          matchedAny = true;
          break;
        }
      } else {
        // if it's a word, we do not match single keypress; ignore here
      }
    }

    // For word matching: allow typing into the typingInput + Enter to submit and clear a falling word
    // We'll handle that via input's Enter handler below

    if (!matchedAny) {
      // small penalty for wrong key press
      Engine.misses += 0; // optionally increment misses on wrong press; set to 1 to penalize
    } else {
      // Play small positive feedback: highlight feedbackEl
      feedbackEl.innerHTML = `<span class="text-green-700 font-semibold">Great!</span>`;
      scoreDisplay.textContent = `Score: ${Engine.score}`;
    }
  }

  // Additionally allow the student to type whole words into the provided input and press Enter
  if (typingInput) {
    typingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = (typingInput.value || '').trim();
        if (!val) return;
        // check if any falling item matches this word exactly (case-insensitive)
        let foundIndex = -1;
        for (let i = 0; i < Engine.falling.length; i++) {
          const it = Engine.falling[i];
          if (!it.matched && it.text.toLowerCase() === val.toLowerCase()) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex >= 0) {
          // mark matched
          Engine.falling[foundIndex].matched = true;
          Engine.score += Math.max(1, Math.round(Engine.falling[foundIndex].text.length / 1));
          feedbackEl.innerHTML = `<span class="text-green-700 font-semibold">Correct: ${escapeHtml(val)}</span>`;
          scoreDisplay.textContent = `Score: ${Engine.score}`;
          typingInput.value = '';
        } else {
          feedbackEl.innerHTML = `<span class="text-red-600">No matching falling word. Try again.</span>`;
        }
      }
    });
  }

  // Update progress UI when a falling item is removed (either hit or missed)
  function updateProgressUIOnMissOrHit(isHit) {
    const completed = Engine.levelQueue[Engine.activeLevelIndex].items.length - (Engine.totalItemsThisLevelRemaining ? Engine.totalItemsThisLevelRemaining : 0);
    // Instead we count how many were spawned and how many have been removed:
    const total = Engine.totalItemsThisLevel;
    // count removed count = items originally spawned (spawnIndex) minus currently falling
    const spawned = Engine.spawnIndex;
    const removed = spawned - Engine.falling.length;
    progressDisplay.textContent = `${removed} / ${total}`;
    scoreDisplay.textContent = `Score: ${Engine.score}`;
  }

  // Finish topic: show summary and control buttons
  function finishTopic() {
    teardownCanvas();
    // final metrics
    const elapsed = Math.max(1, Date.now() - Engine.startTime);
    const elapsedSec = Math.round(elapsed / 1000);
    const finalScore = Engine.score;
    const misses = Engine.misses;
    // show summary in gameContent area (we will keep the same containers)
    gameContent.innerHTML = `
      <div class="p-4">
        <div class="text-xl font-bold text-blue-700 mb-2">Session Complete 🎉</div>
        <div class="mb-2">Topic: <strong>${escapeHtml(Engine.entry.topic.title)}</strong></div>
        <div class="mb-2">Score: <strong>${finalScore}</strong></div>
        <div class="mb-2">Misses: <strong>${misses}</strong></div>
        <div class="mb-2">Time: <strong>${elapsedSec}s</strong></div>
      </div>
    `;
    // show Restart, Next, Home buttons
    attachEndButtons();
  }

  // Create Next & Home buttons; reuse existing restart and back by wiring them
  function attachEndButtons() {
    // ensure restart exists and wired
    if (restartBtn) {
      restartBtn.style.display = 'inline-block';
      restartBtn.onclick = () => {
        // restart current topic from level 0
        beginTopic(Engine.entry);
      };
    }
    if (backBtn) {
      backBtn.style.display = 'inline-block';
      backBtn.onclick = () => window.location.href = 'classes.html';
    }
    // Next button: create if missing
    if (!nextBtn) {
      nextBtn = document.createElement('button');
      nextBtn.className = 'px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition';
      nextBtn.textContent = 'Next';
      nextBtn.style.marginLeft = '8px';
      nextBtn.addEventListener('click', () => {
        // find next topic index in flatTopics
        const idx = flatTopics.findIndex(t => 
          t.yearId===Engine.entry.yearId && t.termNumber===Engine.entry.termNumber && t.categoryId===Engine.entry.categoryId && t.topicIndex===Engine.entry.topicIndex
        );
        if (idx >= 0 && idx+1 < flatTopics.length) {
          beginTopic(flatTopics[idx+1]);
        } else {
          alert('No next topic available.');
        }
      });
    }
    // Home button: create if missing
    if (!homeBtn) {
      homeBtn = document.createElement('button');
      homeBtn.className = 'px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-50 transition';
      homeBtn.textContent = 'Home';
      homeBtn.style.marginLeft = '8px';
      homeBtn.addEventListener('click', () => window.location.href = 'index.html');
    }
    // append to the action area (we'll place them below the game container)
    // We'll place them after the #game-content area inside the parent (gameContainer)
    // Remove existing appended to avoid duplicates
    const places = gameContainer.querySelectorAll('.sk-action-row');
    places.forEach(p => p.remove());
    const actionRow = document.createElement('div');
    actionRow.className = 'sk-action-row mt-4 flex gap-3';
    actionRow.appendChild(restartBtn.cloneNode(true));
    actionRow.appendChild(nextBtn);
    actionRow.appendChild(backBtn.cloneNode(true));
    actionRow.appendChild(homeBtn);
    // Replace original restart/back buttons (the clones don't have handlers) — so wire proper ones:
    // We will set actual restart/back below:
    actionRow.querySelectorAll('button').forEach(b => b.classList.add('sk-clone'));
    // append
    gameContainer.appendChild(actionRow);
    // wire up real handlers on visible buttons
    // find the actual clones by text and attach handlers
    const clones = gameContainer.querySelectorAll('.sk-clone');
    clones.forEach(c => {
      const txt = c.textContent.trim().toLowerCase();
      if (txt === 'restart') {
        c.onclick = () => beginTopic(Engine.entry);
      } else if (txt === 'back to topics' || txt === 'back') {
        c.onclick = () => { hideGameUI(); };
      } else if (txt === 'next') {
        c.onclick = () => {
          const idx = flatTopics.findIndex(t => 
            t.yearId===Engine.entry.yearId && t.termNumber===Engine.entry.termNumber && t.categoryId===Engine.entry.categoryId && t.topicIndex===Engine.entry.topicIndex
          );
          if (idx >= 0 && idx+1 < flatTopics.length) {
            beginTopic(flatTopics[idx+1]);
          } else {
            alert('No next topic available.');
          }
        };
      } else if (txt === 'home') {
        c.onclick = () => window.location.href = 'index.html';
      } else {
        // fallback
      }
    });
  }

  // when finishing all topics / user goes back, ensure original restart/back buttons remain visible in original UI
  // Make restart/back default handlers (if not used in end state)
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (Engine.entry) beginTopic(Engine.entry);
      else location.reload();
    });
  }
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // default: go back to classes page
      window.location.href = 'classes.html';
    });
  }

  // Initialize
  init();

  // expose minimal API for debugging
  window.SKKeyboard = {
    beginTopicFromIndex(i) { if (flatTopics[i]) beginTopic(flatTopics[i]); },
    rawData, flatTopics, Engine
  };
})();
