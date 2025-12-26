// ---------- QUIZ CONFIG ----------

const QUESTIONS = [
  {
    id: 1,
    text: "What does HTML do in web development?",
    options: [
      "Defines the structure of the page content",
      "Runs backend logic",
      "Manages the database",
      "Renders 3D graphics"
    ],
    correctIndex: 0,
    difficulty: "easy",
    category: "Web basics",
    explanation:
      "HTML is the skeleton of the page – it defines headings, paragraphs, links, forms and other elements."
  },
  {
    id: 2,
    text: "Which HTTP status code means the resource was not found?",
    options: ["200", "301", "404", "500"],
    correctIndex: 2,
    difficulty: "easy",
    category: "HTTP",
    explanation: "404 Not Found means the requested resource does not exist at that URL."
  },
  {
    id: 3,
    text: "What does 'responsive design' mean?",
    options: [
      "The page automatically adapts to different devices",
      "The page reacts to mouse clicks",
      "The page only uses CSS grid",
      "The page refreshes every minute"
    ],
    correctIndex: 0,
    difficulty: "medium",
    category: "CSS",
    explanation:
      "Responsive design means the layout works well on phones, tablets and desktops without breaking visually."
  },
  {
    id: 4,
    text: "What is the main purpose of Git?",
    options: [
      "Hosting web pages",
      "Version control and tracking code changes",
      "Creating databases",
      "Optimizing server performance"
    ],
    correctIndex: 1,
    difficulty: "medium",
    category: "Git",
    explanation:
      "Git is a version control system for tracking changes, branching, merging and collaborating on code safely."
  },
  {
    id: 5,
    text: "What do you call a JavaScript function that 'remembers' its lexical scope even after execution?",
    options: ["Callback", "Closure", "Promise", "Generator"],
    correctIndex: 1,
    difficulty: "hard",
    category: "JavaScript",
    explanation:
      "A closure is a function that retains access to the scope in which it was created, even after that scope has executed."
  },
  {
    id: 6,
    text: "Which SQL statement returns data from a table?",
    options: ["UPDATE", "SELECT", "DELETE", "INSERT"],
    correctIndex: 1,
    difficulty: "easy",
    category: "SQL",
    explanation: "SELECT is used to retrieve data from a table."
  },
  {
    id: 7,
    text: "What does the acronym 'API' stand for?",
    options: [
      "Advanced Program Interface",
      "Application Programming Interface",
      "Automated Program Interaction",
      "Applied Protocol Integration"
    ],
    correctIndex: 1,
    difficulty: "medium",
    category: "Backend",
    explanation:
      "API stands for Application Programming Interface – it defines how other code or systems can interact with a service."
  },
  {
    id: 8,
    text: "In a REST API, what does the HTTP method POST usually represent?",
    options: [
      "Fetching a resource",
      "Completely deleting a resource",
      "Creating a new resource",
      "Partially updating a resource"
    ],
    correctIndex: 2,
    difficulty: "medium",
    category: "HTTP",
    explanation:
      "POST is typically used to create a new resource on the server, for example a new user or a new record."
  }
];

const DIFFICULTY_WEIGHTS = {
  easy: 10,
  medium: 20,
  hard: 30
};

const MODES = {
  normal: {
    id: "normal",
    label: "Normal",
    timeLimit: 120,
    wrongPenalty: 0
  },
  hardcore: {
    id: "hardcore",
    label: "Hardcore",
    timeLimit: 75,
    wrongPenalty: 5
  }
};

const QUESTIONS_PER_RUN = 6;

// ---------- DOM ELEMENTS ----------

// Screens
const screenStart = document.getElementById("screen-start");
const screenQuiz = document.getElementById("screen-quiz");
const screenResult = document.getElementById("screen-result");

// Start screen
const modeButtons = document.querySelectorAll(".mode-btn");
const startBtn = document.getElementById("start-btn");

// Quiz
const currentModeLabelEl = document.getElementById("current-mode-label");
const questionCounterEl = document.getElementById("question-counter");
const currentScoreEl = document.getElementById("current-score");
const timerEl = document.getElementById("timer");
const currentStreakEl = document.getElementById("current-streak");
const progressBarEl = document.getElementById("progress-bar");

const questionTextEl = document.getElementById("question-text");
const difficultyEl = document.getElementById("question-difficulty");
const categoryEl = document.getElementById("question-category");
const optionsContainerEl = document.getElementById("options-container");
const feedbackEl = document.getElementById("feedback");
const explanationEl = document.getElementById("explanation");

const sideCorrectEl = document.getElementById("side-correct");
const sideWrongEl = document.getElementById("side-wrong");
const sideMaxStreakEl = document.getElementById("side-max-streak");

const nextBtn = document.getElementById("next-btn");

// Result screen
const finalPercentageEl = document.getElementById("final-percentage");
const finalTitleEl = document.getElementById("final-title");
const finalSubtitleEl = document.getElementById("final-subtitle");
const finalScoreEl = document.getElementById("final-score");
const finalCorrectEl = document.getElementById("final-correct");
const finalWrongEl = document.getElementById("final-wrong");
const finalMaxStreakEl = document.getElementById("final-max-streak");
const bestScoreTextEl = document.getElementById("best-score-text");
const runsTextEl = document.getElementById("runs-text");

const playAgainBtn = document.getElementById("play-again-btn");
const backToStartBtn = document.getElementById("back-to-start-btn");

// Global header
const globalBestEl = document.getElementById("global-best");
const totalRunsEl = document.getElementById("total-runs");

// ---------- STATE ----------

const STORAGE_KEYS = {
  BEST_SCORE: "brutalQuizBestScore",
  BEST_PERCENTAGE: "brutalQuizBestPercentage",
  TOTAL_RUNS: "brutalQuizTotalRuns"
};

let state = {
  mode: MODES.normal,
  questions: [],
  currentIndex: 0,
  score: 0,
  timeLeft: 0,
  timerId: null,
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  maxStreak: 0,
  finished: false,
  timeRanOut: false
};

// ---------- UTILITIES ----------

function shuffleArray(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function pickQuestions() {
  const shuffled = shuffleArray(QUESTIONS);
  return shuffled.slice(0, QUESTIONS_PER_RUN);
}

function getMaxScoreForQuestions(questions) {
  return questions.reduce(
    (sum, q) => sum + (DIFFICULTY_WEIGHTS[q.difficulty] || 10),
    0
  );
}

function loadPersistentStats() {
  const bestScore = Number(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || 0);
  const bestPercentage = Number(
    localStorage.getItem(STORAGE_KEYS.BEST_PERCENTAGE) || 0
  );
  const totalRuns = Number(localStorage.getItem(STORAGE_KEYS.TOTAL_RUNS) || 0);

  if (bestScore > 0) {
    globalBestEl.textContent = `${bestScore} (${bestPercentage}%)`;
  } else {
    globalBestEl.textContent = "—";
  }

  totalRunsEl.textContent = String(totalRuns);
}

function saveRun(score, percentage) {
  const bestScore = Number(localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || 0);
  const bestPercentage = Number(
    localStorage.getItem(STORAGE_KEYS.BEST_PERCENTAGE) || 0
  );
  let totalRuns = Number(
    localStorage.getItem(STORAGE_KEYS.TOTAL_RUNS) || 0
  );

  totalRuns += 1;
  localStorage.setItem(STORAGE_KEYS.TOTAL_RUNS, String(totalRuns));

  if (score > bestScore) {
    localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(score));
    localStorage.setItem(
      STORAGE_KEYS.BEST_PERCENTAGE,
      String(percentage)
    );
  } else if (score === bestScore && percentage > bestPercentage) {
    localStorage.setItem(
      STORAGE_KEYS.BEST_PERCENTAGE,
      String(percentage)
    );
  }

  loadPersistentStats();
}

// ---------- QUIZ LOGIC ----------

function setMode(modeId) {
  const mode = MODES[modeId] || MODES.normal;
  state.mode = mode;

  modeButtons.forEach((btn) => {
    const id = btn.getAttribute("data-mode");
    if (id === mode.id) {
      btn.classList.add("mode-active");
    } else {
      btn.classList.remove("mode-active");
    }
  });

  currentModeLabelEl.textContent = mode.label;
}

function resetStateForNewRun() {
  state.questions = pickQuestions();
  state.currentIndex = 0;
  state.score = 0;
  state.timeLeft = state.mode.timeLimit;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.finished = false;
  state.timeRanOut = false;
}

function showScreen(screen) {
  [screenStart, screenQuiz, screenResult].forEach((s) =>
    s.classList.remove("panel-active")
  );
  screen.classList.add("panel-active");
}

function startTimer() {
  clearInterval(state.timerId);
  timerEl.textContent = `${state.timeLeft}s`;
  timerEl.style.color = "#0f172a";

  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    timerEl.textContent = `${state.timeLeft}s`;

    if (state.timeLeft <= 10) {
      timerEl.style.color = "#f97316";
    }
    if (state.timeLeft <= 5) {
      timerEl.style.color = "#dc2626";
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      state.timeLeft = 0;
      state.timeRanOut = true;
      finishQuiz();
    }
  }, 1000);
}

function startQuiz() {
  resetStateForNewRun();
  showScreen(screenQuiz);
  updateQuizHeader();
  showQuestion();
  startTimer();
}

function updateQuizHeader() {
  const total = state.questions.length;
  const current = state.currentIndex + 1;
  questionCounterEl.textContent = `${current} / ${total}`;
  currentScoreEl.textContent = state.score;
  currentStreakEl.textContent = state.streak;
  sideCorrectEl.textContent = state.correctCount;
  sideWrongEl.textContent = state.wrongCount;
  sideMaxStreakEl.textContent = state.maxStreak;

  const progressPercent = (state.currentIndex / total) * 100;
  progressBarEl.style.width = `${progressPercent}%`;
}

function showQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) {
    finishQuiz();
    return;
  }

  updateQuizHeader();

  questionTextEl.textContent = q.text;
  difficultyEl.textContent = q.difficulty.toUpperCase();
  categoryEl.textContent = q.category;

  feedbackEl.textContent = "";
  feedbackEl.classList.remove("ok", "bad");
  explanationEl.textContent = "";

  optionsContainerEl.innerHTML = "";
  q.options.forEach((text, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `
      <span class="option-index">${String.fromCharCode(65 + index)}</span>
      <span class="option-text">${text}</span>
    `;
    btn.addEventListener("click", () => handleAnswer(index));
    optionsContainerEl.appendChild(btn);
  });

  nextBtn.disabled = true;
}

function handleAnswer(selectedIndex) {
  if (state.finished) return;

  const q = state.questions[state.currentIndex];
  const buttons = optionsContainerEl.querySelectorAll(".option-btn");

  buttons.forEach((b) => b.classList.add("disabled"));

  const isCorrect = selectedIndex === q.correctIndex;

  if (isCorrect) {
    const base = DIFFICULTY_WEIGHTS[q.difficulty] || 10;
    state.streak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.streak);

    const streakBonus = state.streak > 1 ? (state.streak - 1) * 3 : 0;
    state.score += base + streakBonus;
    state.correctCount += 1;
  } else {
    state.wrongCount += 1;
    state.streak = 0;
    const penalty = state.mode.wrongPenalty || 0;
    if (penalty > 0) {
      state.score = Math.max(0, state.score - penalty);
    }
  }

  buttons.forEach((btn, index) => {
    if (index === q.correctIndex) {
      btn.classList.add("correct");
    }
    if (index === selectedIndex && !isCorrect) {
      btn.classList.add("wrong");
    }
  });

  if (isCorrect) {
    feedbackEl.textContent = "Correct ✔ Nice one.";
    feedbackEl.classList.remove("bad");
    feedbackEl.classList.add("ok");
  } else {
    feedbackEl.textContent = "Wrong ✖ That one hurt your score.";
    feedbackEl.classList.remove("ok");
    feedbackEl.classList.add("bad");
  }

  explanationEl.textContent = q.explanation;

  currentScoreEl.textContent = state.score;
  currentStreakEl.textContent = state.streak;
  sideCorrectEl.textContent = state.correctCount;
  sideWrongEl.textContent = state.wrongCount;
  sideMaxStreakEl.textContent = state.maxStreak;

  nextBtn.disabled = false;
}

function goToNextQuestion() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) {
    finishQuiz();
  } else {
    showQuestion();
  }
}

function finishQuiz() {
  if (state.finished) return;
  state.finished = true;
  clearInterval(state.timerId);

  progressBarEl.style.width = "100%";

  const maxScore = getMaxScoreForQuestions(state.questions);
  const percentage =
    maxScore > 0 ? Math.round((state.score / maxScore) * 100) : 0;

  finalPercentageEl.textContent = `${percentage}%`;
  finalScoreEl.textContent = `${state.score} / ${maxScore}`;
  finalCorrectEl.textContent = state.correctCount;
  finalWrongEl.textContent = state.wrongCount;
  finalMaxStreakEl.textContent = state.maxStreak;

  let title;
  let subtitle;

  if (percentage <= 40) {
    title = "Rank: Beginner";
    subtitle =
      "You’ve got the basics. With a few more runs this score will climb quickly.";
  } else if (percentage <= 75) {
    title = "Rank: Solid Dev";
    subtitle =
      "Nice! You clearly know your stuff. Push a bit more and you’re in Brutal territory.";
  } else {
    title = "Rank: Brutal Mind";
    subtitle =
      "You’re playing on hard mode in your head already. This quiz is warm-up for you.";
  }

  if (state.timeRanOut) {
    subtitle += " (Time ran out – time management is part of the challenge.)";
  }

  finalTitleEl.textContent = title;
  finalSubtitleEl.textContent = subtitle;

  saveRun(state.score, percentage);

  const bestScore = Number(
    localStorage.getItem(STORAGE_KEYS.BEST_SCORE) || 0
  );
  const bestPercentage = Number(
    localStorage.getItem(STORAGE_KEYS.BEST_PERCENTAGE) || 0
  );
  const totalRuns = Number(
    localStorage.getItem(STORAGE_KEYS.TOTAL_RUNS) || 0
  );

  if (state.score >= bestScore && percentage >= bestPercentage) {
    bestScoreTextEl.textContent =
      "New personal best! This run sets your new benchmark.";
  } else if (bestScore > 0) {
    bestScoreTextEl.textContent = `Your best run so far: ${bestScore} points (${bestPercentage}%).`;
  } else {
    bestScoreTextEl.textContent =
      "Play a few more times to establish your first solid benchmark.";
  }

  runsTextEl.textContent = `Total runs played: ${totalRuns}.`;

  showScreen(screenResult);
}

// ---------- EVENTS ----------

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const modeId = btn.getAttribute("data-mode");
    setMode(modeId);
  });
});

startBtn.addEventListener("click", () => {
  startQuiz();
});

nextBtn.addEventListener("click", () => {
  goToNextQuestion();
});

playAgainBtn.addEventListener("click", () => {
  startQuiz();
});

backToStartBtn.addEventListener("click", () => {
  clearInterval(state.timerId);
  showScreen(screenStart);
});

// Init
setMode("normal");
loadPersistentStats();
