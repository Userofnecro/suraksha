/**
 * chatbot.js - Static keyword-based chat assistant
 * Suraksha Election Literacy Assistant
 *
 * NO API calls, NO external dependencies — fully offline keyword matching.
 */

import { trapFocus, sanitize } from './utils.js';

/** @type {Function|null} Focus trap cleanup */
let focusTrapCleanup = null;

/** @type {HTMLElement|null} Element that triggered the chat open */
let triggerElement = null;

/**
 * Knowledge base — keyword groups mapped to answers.
 * ORDER MATTERS: more specific entries must come before entries whose keywords
 * are substrings of more specific phrases.
 * - "lost" entry before "register" (both match "I lost my voter id card")
 * - "polling day" entry before "polling/booth" (both match "When is polling day?")
 * @type {Array<{keywords: string[], answer: string}>}
 */
const KNOWLEDGE_BASE = [
  {
    keywords: ['eligible', 'eligibility', 'qualify', 'age'],
    answer: 'To be eligible to vote in India you must be at least 18 years old, an Indian citizen, and listed on the Electoral Roll of your constituency. 🗳️'
  },
  {
    // Before "register" — "I lost my voter id card" contains "voter id"
    keywords: ['lost', 'id card', 'duplicate', 'replacement'],
    answer: 'If you lost your Voter ID apply for a duplicate at voters.eci.gov.in under the EPIC Reprint option. You can also use alternative documents like Aadhaar or Passport at the polling booth. 🪪'
  },
  {
    keywords: ['register', 'registration', 'voter id', 'enroll'],
    answer: 'You can register to vote at voters.eci.gov.in or visit your nearest BLO (Booth Level Officer). You need proof of age and address. Registration is free! 📋'
  },
  {
    keywords: ['evm', 'electronic voting machine', 'machine'],
    answer: 'EVM stands for Electronic Voting Machine. It is a tamper-proof device used to record votes. After voting you get a VVPAT slip confirming your choice. ✅'
  },
  {
    keywords: ['nota', 'none of the above'],
    answer: 'NOTA means None Of The Above. It appears as the last option on the EVM. You can choose it if you don\'t want to vote for any candidate. Your vote still counts! 🚫'
  },
  {
    keywords: ['vvpat', 'paper', 'slip', 'audit'],
    answer: 'VVPAT is Voter Verifiable Paper Audit Trail. After pressing the EVM button a paper slip appears for 7 seconds showing your voted candidate. It confirms your vote was recorded correctly. 🧾'
  },
  {
    // Before "polling/booth" — "When is polling day?" contains "polling"
    keywords: ['polling day', 'voting day', 'election day', 'date'],
    answer: 'Polling Day is announced by the Election Commission of India. Check eci.gov.in for the latest election schedule in your state. �'
  },
  {
    keywords: ['polling', 'booth', 'where', 'location', 'station'],
    answer: 'Find your polling booth at electoralsearch.eci.gov.in — enter your name or Voter ID. Polling stations are usually schools or community halls in your area. �'
  },
  {
    keywords: ['eci', 'election commission', 'who conducts'],
    answer: 'The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering elections. Visit eci.gov.in for official info. 🏛️'
  },
  {
    keywords: ['code of conduct', 'mcc', 'model code'],
    answer: 'The Model Code of Conduct (MCC) is a set of guidelines for political parties and candidates during elections. It comes into effect when elections are announced and ensures free and fair elections. 📜'
  },
  {
    keywords: ['moved', 'shifted', 'new city', 'change address'],
    answer: 'If you moved cities you need to re-register at your new address. Submit Form 8A at voters.eci.gov.in to update your address on the Electoral Roll. 🏠'
  },
  {
    keywords: ['lost', 'id card', 'duplicate', 'replacement'],
    answer: 'If you lost your Voter ID apply for a duplicate at voters.eci.gov.in under the EPIC Reprint option. You can also use alternative documents like Aadhaar or Passport at the polling booth. 🪪'
  },
  {
    keywords: ['helpline', 'help', 'contact', 'support', '1950'],
    answer: 'For any election related help call the National Voter Helpline at 1950 (toll-free). You can also email complaints at complaints.eci.gov.in. 📞'
  },
  {
    keywords: ['secret', 'private', 'who knows', 'anonymous'],
    answer: 'Your vote is completely secret! No one — not the government, your employer, or anyone else — can see who you voted for. The secret ballot is your constitutional right. 🔏'
  },
  {
    keywords: ['result', 'counting', 'winner', 'outcome'],
    answer: 'After Polling Day votes are counted at counting centres under ECI supervision. Results are usually declared the same day. Check eci.gov.in for live results. 📊'
  }
];

const DEFAULT_ANSWER = 'I\'m not sure about that one! 🤔 For detailed help please call Voter Helpline 1950 (toll-free) or visit eci.gov.in — they have all the answers. 🗳️';

/**
 * Initialize the chatbot component.
 */
export function initChatbot() {
  const trigger = document.getElementById('chat-trigger');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const chips = document.querySelectorAll('.chat-panel__chip');

  if (!trigger || !panel) return;

  // Open chat
  trigger.addEventListener('click', () => {
    triggerElement = trigger;
    openChat();
  });

  // Close chat
  closeBtn?.addEventListener('click', closeChat);

  // Escape key closes chat
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeChat();
  });

  // Send on button click
  sendBtn?.addEventListener('click', handleSend);

  // Send on Enter (not Shift+Enter)
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Quick reply chips
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const msg = chip.dataset.message;
      if (input && msg) {
        input.value = msg;
        handleSend();
      }
    });
  });

  // Initial bot greeting
  appendBotMessage("Hi! I'm Suraksha 🗳️ Ask me anything about elections, voter registration, your rights, or the voting process. I'm here to help!");
}

/**
 * Open the chat panel and set up focus trap.
 */
function openChat() {
  const panel = document.getElementById('chat-panel');
  const trigger = document.getElementById('chat-trigger');
  if (!panel) return;

  panel.removeAttribute('hidden');
  requestAnimationFrame(() => panel.classList.add('is-open'));
  trigger?.setAttribute('aria-expanded', 'true');

  focusTrapCleanup = trapFocus(panel);
}

/**
 * Close the chat panel and restore focus.
 */
function closeChat() {
  const panel = document.getElementById('chat-panel');
  const trigger = document.getElementById('chat-trigger');
  if (!panel) return;

  panel.classList.remove('is-open');
  trigger?.setAttribute('aria-expanded', 'false');

  panel.addEventListener('transitionend', () => {
    panel.setAttribute('hidden', '');
  }, { once: true });

  if (focusTrapCleanup) {
    focusTrapCleanup();
    focusTrapCleanup = null;
  }

  if (triggerElement) {
    triggerElement.focus();
    triggerElement = null;
  }
}

/**
 * Handle sending a user message.
 */
async function handleSend() {
  const input = document.getElementById('chat-input');
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  appendUserMessage(message);

  // Show loading indicator
  const loadingId = showLoadingIndicator();

  // Simulate typing delay (600ms) for natural feel
  setTimeout(() => {
    removeLoadingIndicator(loadingId);
    const reply = getAnswer(message);
    appendBotMessage(reply);
  }, 600);
}

/**
 * Match user message against knowledge base and return answer.
 *
 * Matching rules:
 * - Convert input to lowercase before comparing
 * - Within each entry, check longer keywords first (avoids "polling" matching
 *   before "polling day" when both entries could apply)
 * - Across entries, the first match wins — entries are ordered most-specific first
 * - If no entry matches, return the default answer
 *
 * @param {string} userMessage - User's question
 * @returns {string} Matched answer or default
 */
function getAnswer(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  for (const entry of KNOWLEDGE_BASE) {
    // Sort keywords longest-first so multi-word phrases are checked before
    // single words (e.g. "polling day" before "polling")
    const sortedKeywords = [...entry.keywords].sort((a, b) => b.length - a.length);
    for (const keyword of sortedKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return entry.answer;
      }
    }
  }

  return DEFAULT_ANSWER;
}

/**
 * Append a bot message bubble to the chat log.
 * @param {string} text - Bot response text
 */
function appendBotMessage(text) {
  const log = document.getElementById('chat-messages');
  if (!log) return;

  const msg = document.createElement('div');
  msg.className = 'chat-message chat-message--bot';

  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  bubble.textContent = text;

  msg.appendChild(bubble);
  log.appendChild(msg);
  scrollChatToBottom();
}

/**
 * Append a user message bubble to the chat log.
 * @param {string} text - User input
 */
function appendUserMessage(text) {
  const log = document.getElementById('chat-messages');
  if (!log) return;

  const msg = document.createElement('div');
  msg.className = 'chat-message chat-message--user';

  const bubble = document.createElement('div');
  bubble.className = 'chat-message__bubble';
  bubble.textContent = sanitize(text);

  msg.appendChild(bubble);
  log.appendChild(msg);
  scrollChatToBottom();
}

/**
 * Show a 3-dot loading indicator in the chat.
 * @returns {string} ID of the loading element for later removal
 */
function showLoadingIndicator() {
  const log = document.getElementById('chat-messages');
  if (!log) return '';

  const id = `loading-${Date.now()}`;
  const loading = document.createElement('div');
  loading.className = 'chat-loading';
  loading.id = id;
  loading.setAttribute('role', 'status');
  loading.setAttribute('aria-label', 'Suraksha is thinking');

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'chat__dot';
    loading.appendChild(dot);
  }

  log.appendChild(loading);
  scrollChatToBottom();
  return id;
}

/**
 * Remove the loading indicator by ID.
 * @param {string} id
 */
function removeLoadingIndicator(id) {
  document.getElementById(id)?.remove();
}

/**
 * Scroll the chat messages container to the bottom.
 */
function scrollChatToBottom() {
  const log = document.getElementById('chat-messages');
  if (log) log.scrollTop = log.scrollHeight;
}
