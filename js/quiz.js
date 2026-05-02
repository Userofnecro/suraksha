/**
 * quiz.js - Quiz state machine for election knowledge quiz
 * Suraksha Election Literacy Assistant
 */

/** @type {Array<{question: string, options: string[], correct: number, explanation: string}>} */
const QUIZ_QUESTIONS = [
  {
    question: 'What is the minimum voting age in India?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correct: 1,
    explanation: 'The 61st Constitutional Amendment (1988) lowered the voting age from 21 to 18 years.'
  },
  {
    question: 'What does EVM stand for?',
    options: ['Electronic Voter Machine', 'Electronic Voting Machine', 'Electoral Voting Method', 'Electronic Vote Monitor'],
    correct: 1,
    explanation: 'EVM stands for Electronic Voting Machine. India introduced EVMs to replace paper ballots for faster, more accurate counting.'
  },
  {
    question: 'What is NOTA?',
    options: ['National Order of Tribal Affairs', 'None Of The Above', 'National Official Tally Authority', 'New Order of Total Abstention'],
    correct: 1,
    explanation: 'NOTA (None Of The Above) allows voters to reject all candidates. It was introduced by the Supreme Court in 2013.'
  },
  {
    question: 'Who conducts elections in India?',
    options: ['The President of India', 'The Parliament of India', 'Election Commission of India', 'The Supreme Court of India'],
    correct: 2,
    explanation: 'The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering all elections.'
  },
  {
    question: 'What is a VVPAT?',
    options: ['Voter Verifiable Paper Audit Trail', 'Verified Voter Paper Authentication Terminal', 'Voter Validation and Paper Audit Tool', 'Verified Voting Paper Accountability Tracker'],
    correct: 0,
    explanation: 'VVPAT (Voter Verifiable Paper Audit Trail) is a printer attached to EVMs that prints a paper slip showing your vote, allowing you to verify your choice.'
  }
];

/** @type {{currentIndex: number, score: number, answered: boolean}} */
const quizState = {
  currentIndex: 0,
  score: 0,
  answered: false
};

/**
 * Initialize the quiz component.
 */
export function initQuiz() {
  const quizWrapper = document.getElementById('quiz-wrapper');
  if (!quizWrapper) return;
  renderQuestion();
}

/**
 * Render the current question into #quiz-wrapper.
 */
function renderQuestion() {
  const quizWrapper = document.getElementById('quiz-wrapper');
  if (!quizWrapper) return;

  const q = QUIZ_QUESTIONS[quizState.currentIndex];
  const total = QUIZ_QUESTIONS.length;
  const progressPct = (quizState.currentIndex / total) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  // Progress bar
  const progressTrack = el('div', 'quiz__progress-bar-track');
  const progressFill = el('div', 'quiz__progress-bar-fill');
  progressFill.style.width = `${progressPct}%`;
  progressTrack.appendChild(progressFill);

  const progressLabel = el('p', 'quiz__progress-label');
  progressLabel.textContent = `Q${quizState.currentIndex + 1} of ${total}`;

  // Question text
  const questionEl = el('p', 'quiz__question-text');
  questionEl.id = 'question-text';
  questionEl.textContent = q.question;

  // Options group
  const optionsGroup = el('div', 'quiz__options');
  optionsGroup.setAttribute('role', 'group');
  optionsGroup.setAttribute('aria-labelledby', 'question-text');

  q.options.forEach((option, i) => {
    const btn = el('button', 'quiz__option');
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.dataset.index = String(i);

    const letterSpan = el('span', 'quiz__option-letter');
    letterSpan.setAttribute('aria-hidden', 'true');
    letterSpan.textContent = letters[i];

    const textSpan = el('span', '');
    textSpan.textContent = option;

    btn.appendChild(letterSpan);
    btn.appendChild(textSpan);
    btn.addEventListener('click', () => handleOptionSelect(i));
    optionsGroup.appendChild(btn);
  });

  // Feedback (aria-live)
  const feedback = el('div', 'quiz__feedback');
  feedback.id = 'quiz-feedback';
  feedback.setAttribute('aria-live', 'assertive');
  feedback.setAttribute('aria-atomic', 'true');

  // Next button
  const nextBtn = el('button', 'btn btn--primary quiz__next-btn');
  nextBtn.id = 'quiz-next-btn';
  nextBtn.textContent = quizState.currentIndex < total - 1 ? 'Next Question →' : 'See Results 🎉';
  nextBtn.addEventListener('click', handleNext);

  // Clear and rebuild
  quizWrapper.innerHTML = '';
  quizWrapper.appendChild(progressTrack);
  quizWrapper.appendChild(progressLabel);
  quizWrapper.appendChild(questionEl);
  quizWrapper.appendChild(optionsGroup);
  quizWrapper.appendChild(feedback);
  quizWrapper.appendChild(nextBtn);

  // Slide-in animation
  quizWrapper.classList.add('quiz__question--enter');
  setTimeout(() => quizWrapper.classList.remove('quiz__question--enter'), 400);
}

/**
 * Handle option selection.
 * @param {number} selectedIndex
 */
function handleOptionSelect(selectedIndex) {
  if (quizState.answered) return;
  quizState.answered = true;

  const q = QUIZ_QUESTIONS[quizState.currentIndex];
  const isCorrect = selectedIndex === q.correct;
  if (isCorrect) quizState.score++;

  // Style options
  const options = document.querySelectorAll('.quiz__option');
  options.forEach((btn, i) => {
    btn.disabled = true;
    btn.setAttribute('aria-checked', i === selectedIndex ? 'true' : 'false');
    if (i === q.correct) {
      btn.classList.add('quiz__option--correct');
    } else if (i === selectedIndex) {
      btn.classList.add('quiz__option--wrong');
    }
  });

  // Show feedback
  const feedback = document.getElementById('quiz-feedback');
  if (feedback) {
    feedback.classList.add('is-visible');
    if (isCorrect) {
      feedback.classList.add('quiz__feedback--correct');
      feedback.textContent = `✅ Correct! ${q.explanation}`;
    } else {
      feedback.classList.add('quiz__feedback--wrong');
      feedback.textContent = `❌ Not quite. ${q.explanation}`;
    }
  }

  // Show next button
  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) {
    nextBtn.classList.add('is-visible');
    nextBtn.focus();
  }
}

/**
 * Advance to next question or show results.
 */
function handleNext() {
  if (quizState.currentIndex < QUIZ_QUESTIONS.length - 1) {
    quizState.currentIndex++;
    quizState.answered = false;
    renderQuestion();
  } else {
    renderResults();
  }
}

/**
 * Render the results screen.
 */
function renderResults() {
  const quizWrapper = document.getElementById('quiz-wrapper');
  if (!quizWrapper) return;

  const score = quizState.score;
  const total = QUIZ_QUESTIONS.length;
  const pct = Math.round((score / total) * 100);

  let emoji = '😊';
  let msg = 'Good effort! Keep learning about your democratic rights.';
  if (pct === 100) { emoji = '🏆'; msg = 'Perfect score! You are a true democracy champion!'; }
  else if (pct >= 80) { emoji = '🎉'; msg = 'Excellent! You know your election rights really well.'; }
  else if (pct >= 60) { emoji = '👍'; msg = 'Good job! A little more reading and you will be an expert.'; }

  const result = el('div', 'quiz__result');

  const scoreEl = el('div', 'quiz__result-score');
  scoreEl.textContent = `${score}/${total} ${emoji}`;

  const msgEl = el('p', 'quiz__result-msg');
  msgEl.textContent = msg;

  const actions = el('div', 'quiz__result-actions');

  const shareBtn = el('button', 'btn btn--secondary');
  shareBtn.textContent = '📤 Share Score';
  shareBtn.addEventListener('click', () => shareScore(score, total));

  const retryBtn = el('button', 'btn btn--outline');
  retryBtn.textContent = '🔄 Try Again';
  retryBtn.addEventListener('click', resetQuiz);

  actions.appendChild(shareBtn);
  actions.appendChild(retryBtn);
  result.appendChild(scoreEl);
  result.appendChild(msgEl);
  result.appendChild(actions);

  quizWrapper.innerHTML = '';
  quizWrapper.appendChild(result);

  fireConfetti();
}

/**
 * Reset quiz to initial state.
 */
function resetQuiz() {
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState.answered = false;
  renderQuestion();
}

/**
 * Share quiz score via Web Share API or clipboard fallback.
 * @param {number} score
 * @param {number} total
 */
async function shareScore(score, total) {
  const text = `I scored ${score}/${total} on the Suraksha Election Literacy Quiz! 🗳️ Test your knowledge — protecting democracy through awareness. #Suraksha #ElectionLiteracy`;
  if (navigator.share) {
    try { await navigator.share({ text }); } catch (_) { /* cancelled */ }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard! Share it with your friends.');
    } catch (_) {
      alert(`Your score: ${text}`);
    }
  }
}

/**
 * Fire a canvas confetti burst on quiz completion.
 * Respects prefers-reduced-motion.
 */
function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF6B00', '#1A56DB', '#22C55E', '#F5C518', '#EF4444', '#8B5CF6'];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    opacity: 1
  }));

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      if (p.y < canvas.height + 20) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vy += 0.05;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.02;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  }
  animate();
}

/**
 * Helper: create an element with a className.
 * @param {string} tag
 * @param {string} className
 * @returns {HTMLElement}
 */
function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
