// games/keyboard.js
import {
  openDB,
  saveStudentProfile,
  getStudentByName,
  saveProgress,
  getProgressForStudent
} from '../js/indexedDB-helper.js';

const params = new URLSearchParams(window.location.search);
const levelParam = params.get('level') || '1';

let config = null;
let levelConfig = null;
let stageIndex = 0;
let itemIndex = 0;
let timeLeft = 420;
let timerInterval = null;
let running = false;
let correct = 0;
let wrong = 0;
let currentStudent = null;
let keyboardDetected = false;

// UI
const studentNameEl = document.getElementById('studentName');
const studentClassEl = document.getElementById('studentClass');
const saveProfileBtn = document.getElementById('saveProfile');
const clearProfileBtn = document.getElementById('clearProfile');
const profileSavedEl = document.getElementById('profileSaved');

const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const fallingEl = document.getElementById('falling-item');
const boardEl = document.getElementById('game-board');
const feedbackEl = document.getElementById('feedback');
const typingInput = document.getElementById('typingInput');
const correctEl = document.getElementById('correct');
const wrongEl = document.getElementById('wrong');
const accuracyEl = document.getElementById('accuracy');
const stageTitleEl = document.getElementById('stageTitle');
const stageProgressEl = document.getElementById('stageProgress');
const noticeEl = document.getElementById('notice');
const endSummaryEl = document.getElementById('endSummary');

// populate class select (1-12)
(function populateClassSelect() {
  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement('option');
    opt.value = `Year ${i}`;
    opt.textContent = `Year ${i}`;
    studentClassEl.appendChild(opt);
  }
})();

// detect external keyboard by any keypress
window.addEventListener('keydown', (e) => {
  keyboardDetected = true;
  noticeEl.textContent = '';
});

// load config
async function loadConfig() {
  const res = await fetch('keyboard.json');
  config = await res.json();
  levelConfig = config.levels[levelParam] || Object.values(config.levels)[0];
  timeLeft = levelConfig.timeLimit || 420;
  updateTimerUI();
  stageTitleEl.textContent = `${levelConfig.label}`;
  updateStageProgress();
}

function updateStageProgress() {
  const total = levelConfig.stages.length;
  stageProgressEl.textContent = `Stage ${stageIndex+1} / ${total}`;
}

function formatTime(sec) {
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = (sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function updateTimerUI() {
  timerEl.textContent = formatTime(timeLeft);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!running) return;
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      endSession();
    }
  }, 1000);
}

function showFeedback(text, type='info') {
  feedbackEl.textContent = text;
  feedbackEl.classList.remove('text-green-600','text-red-600','text-slate-600');
  if (type === 'ok') feedbackEl.classList.add('text-green-600');
  else if (type === 'err') feedbackEl.classList.add('text-red-600');
  else feedbackEl.classList.add('text-slate-600');

  // small fade away
  setTimeout(()=> {
    if (feedbackEl.textContent === text) feedbackEl.textContent = '';
  }, 1200);
}

function showFalling(itemText) {
  // clear animations
  fallingEl.innerHTML = '';
  fallingEl.className = '';
  void fallingEl.offsetWidth; // reflow to restart animations

  fallingEl.textContent = itemText;
  fallingEl.classList.add('drop-enter');
}

async function nextItem() {
  const stage = levelConfig.stages[stageIndex];
  itemIndex++;
  if (itemIndex >= stage.items.length) {
    // stage complete - small pause then next stage
    showFeedback('Stage complete!', 'ok');
    await new Promise(r => setTimeout(r, 800));
    stageIndex++;
    itemIndex = 0;
    if (stageIndex >= levelConfig.stages.length) {
      endSession();
      return;
    } else {
      updateStageProgress();
      renderCurrentItem();
    }
  } else {
    renderCurrentItem();
  }
}

function renderCurrentItem() {
  const stage = levelConfig.stages[stageIndex];
  if (!stage) return;
  stageTitleEl.textContent = `${levelConfig.label} — ${stage.title}`;
  updateStageProgress();

  const item = stage.items[itemIndex];
  if (stage.type === 'key') {
    // show single key very large
    typingInput.classList.add('hidden');
    showFalling(item.toUpperCase());
  } else {
    // word/sentence/code -> show as text and show typing input
    showFalling(item);
    typingInput.classList.remove('hidden');
    typingInput.value = '';
    typingInput.focus({ preventScroll: true });
  }
}

// key handler for 'key' stages
function handleKeyStage(e) {
  const stage = levelConfig.stages[stageIndex];
  const expected = stage.items[itemIndex];
  // normalize
  let keyPressed = e.key;
  // For semicolon on some layouts e.key may be ';' or ':'
  // Use lower case
  if (keyPressed.length === 1) keyPressed = keyPressed.toLowerCase();
  if (keyPressed === expected.toLowerCase()) {
    correct++;
    correctEl.textContent = correct;
    saveImmediateProgress();
    showFeedback('Correct', 'ok');
    nextItem();
  } else {
    wrong++;
    wrongEl.textContent = wrong;
    showFeedback('Try again', 'err');
    // small shake
    fallingEl.classList.add('shake');
    setTimeout(()=> fallingEl.classList.remove('shake'), 400);
  }
}

// for word/sentence/code stages: check typingInput value on Enter or full match
function handleTypingInput(e) {
  if (e.key === 'Enter') {
    const stage = levelConfig.stages[stageIndex];
    const target = stage.items[itemIndex];
    const val = typingInput.value.trim();
    if (val === target) {
      correct++;
      correctEl.textContent = correct;
      saveImmediateProgress();
      showFeedback('Correct', 'ok');
      nextItem();
    } else {
      wrong++;
      wrongEl.textContent = wrong;
      showFeedback('Try again', 'err');
      typingInput.select();
    }
  }
}

function attachHandlers() {
  // we use a single keydown handler that delegates depending on stage
  window.addEventListener('keydown', (e) => {
    // if board disabled or not running, ignore except to detect keyboard presence
    keyboardDetected = true;
    if (!running) return;
    const stage = levelConfig.stages[stageIndex];
    if (!stage) return;
    if (stage.type === 'key') {
      // ignore special keys
      if (e.key.length === 1 || e.key === ';' || e.key === ':') {
        handleKeyStage(e);
      }
    } else {
      // let input handle it; but pressing Enter is captured by input if focused.
    }
  });

  typingInput.addEventListener('keydown', handleTypingInput);
}

// start/pause/reset/save handlers
startBtn.addEventListener('click', () => {
  if (isTouchDevice() && !keyboardDetected) {
    noticeEl.textContent = 'Please connect an external keyboard and press any key to begin.';
    return;
  }
  if (!levelConfig) return;
  if (!running) {
    running = true;
    startTimer();
    renderCurrentItem();
    showFeedback('Session started', 'info');
  }
});

pauseBtn.addEventListener('click', () => {
  running = !running;
  pauseBtn.textContent = running ? 'Pause' : 'Resume';
});

resetBtn.addEventListener('click', () => {
  if (timerInterval) clearInterval(timerInterval);
  running = false;
  stageIndex = 0;
  itemIndex = 0;
  timeLeft = levelConfig.timeLimit || 420;
  correct = 0;
  wrong = 0;
  updateTimerUI();
  correctEl.textContent = '0';
  wrongEl.textContent = '0';
  accuracyEl.textContent = '0%';
  typingInput.classList.add('hidden');
  fallingEl.textContent = '';
  endSummaryEl.classList.add('hidden');
  showFeedback('Reset complete', 'info');
});

// a minimal immediate save so we don't lose progress constantly
function saveImmediateProgress() {
  // saves partial progress (no student required). You may require student profile to link properly
  const rec = {
    studentName: currentStudent?.fullName || null,
    studentClass: currentStudent?.class || null,
    level: levelParam,
    stageIndex,
    itemIndex,
    correct,
    wrong,
    timestamp: Date.now(),
    completed: false
  };
  // fire and forget
  saveProgress(rec).catch(err => console.warn('save failed', err));
}

async function endSession() {
  running = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const total = correct + wrong;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  accuracyEl.textContent = `${accuracy}%`;
  endSummaryEl.classList.remove('hidden');
  endSummaryEl.innerHTML = `
    <div class="font-semibold">Session finished</div>
    <div>Correct: ${correct}</div>
    <div>Wrong: ${wrong}</div>
    <div>Accuracy: ${accuracy}%</div>
  `;
  // save final progress (prefer student profile)
  const finalRec = {
    studentName: currentStudent?.fullName || null,
    studentClass: currentStudent?.class || null,
    level: levelParam,
    stageIndex,
    correct,
    wrong,
    accuracy,
    timestamp: Date.now(),
    completed: true
  };
  try {
    await saveProgress(finalRec);
    showFeedback('Result saved', 'info');
  } catch (err) {
    console.warn('saveProgress failed', err);
  }
}

// profile storage
saveProfileBtn.addEventListener('click', async () => {
  const full = studentNameEl.value.trim();
  const cls = studentClassEl.value;
  if (!full || !cls) {
    profileSavedEl.textContent = 'Please provide name and class';
    setTimeout(()=> profileSavedEl.textContent = '', 2000);
    return;
  }
  const p = { fullName: full, class: cls, createdAt: Date.now() };
  try {
    const saved = await saveStudentProfile(p);
    currentStudent = saved;
    profileSavedEl.textContent = `Saved: ${saved.fullName}`;
    setTimeout(()=> profileSavedEl.textContent = '', 2000);
  } catch (err) {
    console.error(err);
    profileSavedEl.textContent = 'Save failed';
  }
});

clearProfileBtn.addEventListener('click', () => {
  studentNameEl.value = '';
  studentClassEl.value = '';
  currentStudent = null;
  profileSavedEl.textContent = 'Cleared';
  setTimeout(()=> profileSavedEl.textContent = '', 1200);
});

function isTouchDevice() {
  return (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
}

function updateAccuracyUI() {
  const tot = correct + wrong;
  const acc = tot === 0 ? 0 : Math.round((correct / tot) * 100);
  accuracyEl.textContent = `${acc}%`;
}

// render and handlers
async function init() {
  await loadConfig();
  attachHandlers();
  // initialize UI values
  correctEl.textContent = '0';
  wrongEl.textContent = '0';
  accuracyEl.textContent = '0%';
  // populate studentClass input default
  studentClassEl.value = `Year ${parseInt(levelParam)}`;
  // If touch device and no external keyboard yet, show instruction
  if (isTouchDevice()) {
    noticeEl.textContent = 'Mobile detected — connect an external keyboard and press any key to enable Start.';
  }
}

init();
