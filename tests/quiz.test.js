/**
 * tests/quiz.test.js
 * Unit tests for Suraksha quiz scoring, feedback labels, and email validation
 * Run with: node tests/quiz.test.js
 */

// ── Quiz scoring logic (mirrors quiz.js) ──────────────────────────────────

const QUIZ_QUESTIONS = [
  { question: 'What is the minimum voting age in India?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correct: 1 },
  { question: 'What does EVM stand for?',
    options: ['Electronic Voter Machine', 'Electronic Voting Machine',
              'Electoral Voting Method', 'Electronic Vote Monitor'],
    correct: 1 },
  { question: 'What is NOTA?',
    options: ['National Order of Tribal Affairs', 'None Of The Above',
              'National Official Tally Authority', 'New Order of Total Abstention'],
    correct: 1 },
  { question: 'Who conducts elections in India?',
    options: ['The President of India', 'The Parliament of India',
              'Election Commission of India', 'The Supreme Court of India'],
    correct: 2 },
  { question: 'What is a VVPAT?',
    options: ['Voter Verifiable Paper Audit Trail', 'Verified Voter Paper Authentication Terminal',
              'Voter Validation and Paper Audit Tool', 'Verified Voting Paper Accountability Tracker'],
    correct: 0 },
];

function getScoreLabel(score, total) {
  const pct = Math.round((score / total) * 100);
  if (pct === 100) return '🏆';
  if (pct >= 80)  return '🎉';
  if (pct >= 60)  return '👍';
  return '😊';
}

// ── Email validation (mirrors utils.js) ───────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Test runner ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(description, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    failures.push({ description, expected, actual });
  }
}

console.log('Running Suraksha quiz & utils tests...\n');

// ── Quiz: correct answer indices ───────────────────────────────────────────

test('Q1 correct answer is index 1 (18 years)',
  QUIZ_QUESTIONS[0].correct, 1);
test('Q2 correct answer is index 1 (Electronic Voting Machine)',
  QUIZ_QUESTIONS[1].correct, 1);
test('Q3 correct answer is index 1 (None Of The Above)',
  QUIZ_QUESTIONS[2].correct, 1);
test('Q4 correct answer is index 2 (Election Commission of India)',
  QUIZ_QUESTIONS[3].correct, 2);
test('Q5 correct answer is index 0 (Voter Verifiable Paper Audit Trail)',
  QUIZ_QUESTIONS[4].correct, 0);

// ── Quiz: scoring ──────────────────────────────────────────────────────────

function simulateScore(correctCount) {
  let score = 0;
  QUIZ_QUESTIONS.forEach((q, i) => {
    const selected = i < correctCount ? q.correct : (q.correct + 1) % 4;
    if (selected === q.correct) score++;
  });
  return score;
}

test('All 5 correct → score 5',   simulateScore(5), 5);
test('4 correct → score 4',       simulateScore(4), 4);
test('3 correct → score 3',       simulateScore(3), 3);
test('2 correct → score 2',       simulateScore(2), 2);
test('1 correct → score 1',       simulateScore(1), 1);
test('0 correct → score 0',       simulateScore(0), 0);

// ── Quiz: score labels ─────────────────────────────────────────────────────

test('5/5 (100%) → 🏆', getScoreLabel(5, 5), '🏆');
test('4/5 (80%)  → 🎉', getScoreLabel(4, 5), '🎉');
test('3/5 (60%)  → 👍', getScoreLabel(3, 5), '👍');
test('2/5 (40%)  → 😊', getScoreLabel(2, 5), '😊');
test('1/5 (20%)  → 😊', getScoreLabel(1, 5), '😊');
test('0/5 (0%)   → 😊', getScoreLabel(0, 5), '😊');

// ── Quiz: question count ───────────────────────────────────────────────────

test('Quiz has exactly 5 questions', QUIZ_QUESTIONS.length, 5);
test('Each question has 4 options',
  QUIZ_QUESTIONS.every(q => q.options.length === 4), true);
test('All correct indices are 0-3',
  QUIZ_QUESTIONS.every(q => q.correct >= 0 && q.correct <= 3), true);

// ── Email validation ───────────────────────────────────────────────────────

test('valid: user@example.com',    isValidEmail('user@example.com'),   true);
test('valid: a@b.co',              isValidEmail('a@b.co'),             true);
test('valid: test+tag@gmail.com',  isValidEmail('test+tag@gmail.com'), true);
test('valid: name@domain.org',     isValidEmail('name@domain.org'),    true);
test('invalid: no at sign',        isValidEmail('notanemail'),         false);
test('invalid: starts with @',     isValidEmail('@nodomain.com'),      false);
test('invalid: no TLD',            isValidEmail('no@tld'),             false);
test('invalid: empty string',      isValidEmail(''),                   false);
test('invalid: spaces in email',   isValidEmail('spa ces@test.com'),   false);
test('invalid: double @',          isValidEmail('a@@b.com'),           false);

// ── Results ────────────────────────────────────────────────────────────────

console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);

if (failures.length > 0) {
  console.log('FAILURES:');
  failures.forEach(({ description, expected, actual }) => {
    console.log(`  ✗ ${description}`);
    console.log(`    expected: ${JSON.stringify(expected)}`);
    console.log(`    got:      ${JSON.stringify(actual)}`);
  });
  process.exit(1);
} else {
  console.log('All tests passed! ✓');
  process.exit(0);
}
