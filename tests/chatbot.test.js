/**
 * tests/chatbot.test.js
 * Unit tests for Suraksha keyword-based chatbot matching engine
 * Run with: node tests/chatbot.test.js
 */

// ── Inline the matching engine (mirrors chatbot.js logic exactly) ──────────

const KNOWLEDGE_BASE = [
  { keywords: ['eligible', 'eligibility', 'qualify', 'age'],
    answer: 'ELIGIBLE' },
  { keywords: ['lost', 'id card', 'duplicate', 'replacement'],
    answer: 'LOST' },
  { keywords: ['moved', 'shifted', 'new city', 'change address'],
    answer: 'MOVED' },
  { keywords: ['register', 'registration', 'voter id', 'enroll'],
    answer: 'REGISTER' },
  { keywords: ['evm', 'electronic voting machine', 'machine'],
    answer: 'EVM' },
  { keywords: ['nota', 'none of the above'],
    answer: 'NOTA' },
  { keywords: ['vvpat', 'paper', 'slip', 'audit'],
    answer: 'VVPAT' },
  { keywords: ['polling day', 'voting day', 'election day', 'date'],
    answer: 'DATE' },
  { keywords: ['polling', 'booth', 'where', 'location', 'station'],
    answer: 'BOOTH' },
  { keywords: ['helpline', 'help', 'contact', 'support', '1950'],
    answer: 'HELPLINE' },
  { keywords: ['eci', 'election commission', 'who conducts'],
    answer: 'ECI' },
  { keywords: ['code of conduct', 'mcc', 'model code'],
    answer: 'MCC' },
  { keywords: ['secret', 'private', 'who knows', 'anonymous'],
    answer: 'SECRET' },
  { keywords: ['result', 'counting', 'winner', 'outcome'],
    answer: 'RESULT' },
];

const DEFAULT = 'DEFAULT';

function getAnswer(userMessage) {
  const lower = userMessage.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    const sorted = [...entry.keywords].sort((a, b) => b.length - a.length);
    for (const kw of sorted) {
      if (lower.includes(kw.toLowerCase())) return entry.answer;
    }
  }
  return DEFAULT;
}

// ── Test runner ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(description, input, expected) {
  const result = getAnswer(input);
  if (result === expected) {
    passed++;
  } else {
    failed++;
    failures.push({ description, input, expected, result });
  }
}

// ── Test suite ─────────────────────────────────────────────────────────────

console.log('Running Suraksha chatbot tests...\n');

// 1. All 14 Q&A pairs — primary keywords
test('eligible keyword',            'Am I eligible to vote?',          'ELIGIBLE');
test('eligibility keyword',         'What are the eligibility rules?', 'ELIGIBLE');
test('qualify keyword',             'Do I qualify to vote?',           'ELIGIBLE');
test('age keyword',                 'What is the minimum voting age?', 'ELIGIBLE');

test('lost keyword',                'I lost my card',                  'LOST');
test('id card keyword',             'I lost my id card',               'LOST');
test('duplicate keyword',           'I need a duplicate voter card',   'LOST');
test('replacement keyword',         'How to get a replacement?',       'LOST');

test('register keyword',            'How do I register?',              'REGISTER');
test('registration keyword',        'What is the registration process?','REGISTER');
test('voter id keyword',            'How to get voter id?',            'REGISTER');
test('enroll keyword',              'How do I enroll to vote?',        'REGISTER');

test('evm keyword',                 'What is EVM?',                    'EVM');
test('electronic voting machine',   'Tell me about electronic voting machine', 'EVM');
test('machine keyword',             'How does the machine work?',      'EVM');

test('nota keyword',                'What is NOTA?',                   'NOTA');
test('none of the above',           'Can I choose none of the above?', 'NOTA');

test('vvpat keyword',               'What is VVPAT?',                  'VVPAT');
test('paper keyword',               'What is the paper trail?',        'VVPAT');
test('slip keyword',                'What is the paper slip?',         'VVPAT');
test('audit keyword',               'What is paper audit?',            'VVPAT');

test('polling day keyword',         'When is polling day?',            'DATE');
test('voting day keyword',          'When is voting day?',             'DATE');
test('election day keyword',        'When is election day?',           'DATE');
test('date keyword',                'What is the election date?',      'DATE');

test('polling keyword',             'Where is my polling station?',    'BOOTH');
test('booth keyword',               'Find my polling booth',           'BOOTH');
test('where keyword',               'Where do I vote?',                'BOOTH');
test('location keyword',            'What is the voting location?',    'BOOTH');
test('station keyword',             'Where is the voting station?',    'BOOTH');

test('eci keyword',                 'What is ECI?',                    'ECI');
test('election commission keyword', 'Tell me about election commission','ECI');
test('who conducts keyword',        'Who conducts elections in India?', 'ECI');

test('code of conduct keyword',     'What is code of conduct?',        'MCC');
test('mcc keyword',                 'What is MCC?',                    'MCC');
test('model code keyword',          'Explain model code of conduct',   'MCC');

test('moved keyword',               'I moved to another city',         'MOVED');
test('shifted keyword',             'I shifted to Delhi',              'MOVED');
test('new city keyword',            'I am in a new city now',          'MOVED');
test('change address keyword',      'How to change address on voter id?','MOVED');

test('helpline keyword',            'What is the helpline number?',    'HELPLINE');
test('help keyword',                'I need help with voting',         'HELPLINE');
test('contact keyword',             'How do I contact ECI?',           'HELPLINE');
test('support keyword',             'I need support',                  'HELPLINE');
test('1950 keyword',                'Call 1950 for help',              'HELPLINE');

test('secret keyword',              'Is my vote secret?',              'SECRET');
test('private keyword',             'Is voting private?',              'SECRET');
test('who knows keyword',           'Who knows how I voted?',          'SECRET');
test('anonymous keyword',           'Is voting anonymous?',            'SECRET');

test('result keyword',              'When are election results?',      'RESULT');
test('counting keyword',            'How does vote counting work?',    'RESULT');
test('winner keyword',              'Who is the winner?',              'RESULT');
test('outcome keyword',             'What is the election outcome?',   'RESULT');

// 2. Ambiguous inputs — must resolve to correct answer (not bleed into wrong bucket)
test('polling day not booth',       'When is polling day?',            'DATE');
test('lost voter id not register',  'I lost my voter id card',         'LOST');
test('polling station not date',    'Where is my polling station?',    'BOOTH');

// 3. Case insensitivity
test('uppercase input',             'ELIGIBLE TO VOTE',                'ELIGIBLE');
test('uppercase EVM',               'WHAT IS EVM?',                    'EVM');
test('uppercase POLLING DAY',       'WHEN IS POLLING DAY?',            'DATE');
test('mixed case',                  'WhAt Is NoTa?',                   'NOTA');

// 4. All 6 quick reply chips
test('chip: Am I eligible?',        'Am I eligible?',                  'ELIGIBLE');
test('chip: How to register?',      'How to register?',                'REGISTER');
test('chip: What is EVM?',          'What is EVM?',                    'EVM');
test('chip: What is NOTA?',         'What is NOTA?',                   'NOTA');
test('chip: Find polling booth',    'Find polling booth',              'BOOTH');
test('chip: Call Helpline',         'Call Helpline',                   'HELPLINE');

// 5. Default fallback
test('off-topic: weather',          'What is the weather today?',      'DEFAULT');
test('off-topic: joke',             'Tell me a joke',                  'DEFAULT');
test('greeting only',               'hello',                           'DEFAULT');
test('empty string',                '',                                'DEFAULT');
test('whitespace only',             '   ',                             'DEFAULT');
test('unrelated question',          'What is the capital of France?',  'DEFAULT');

// ── Results ────────────────────────────────────────────────────────────────

console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);

if (failures.length > 0) {
  console.log('FAILURES:');
  failures.forEach(({ description, input, expected, result }) => {
    console.log(`  ✗ ${description}`);
    console.log(`    input:    "${input}"`);
    console.log(`    expected: ${expected}`);
    console.log(`    got:      ${result}`);
  });
  process.exit(1);
} else {
  console.log('All tests passed! ✓');
  process.exit(0);
}
