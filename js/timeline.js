/**
 * timeline.js - Election timeline tab/expand logic
 * Suraksha Election Literacy Assistant
 */

/** @type {Array<{id: string, icon: string, label: string, title: string, desc: string, action: string}>} */
const TIMELINE_PHASES = [
  {
    id: 'announcement',
    icon: '📢',
    label: 'Announcement',
    title: '📢 Election Announcement',
    desc: 'The Election Commission of India (ECI) officially announces the election schedule, including dates for nominations, campaigns, polling, and results. This marks the start of the Model Code of Conduct.',
    action: 'Stay informed: Follow ECI official announcements and note key dates in your calendar.'
  },
  {
    id: 'registration',
    icon: '📝',
    label: 'Registration',
    title: '📝 Voter Registration',
    desc: 'Citizens who are 18+ and meet eligibility criteria can register to vote. You can register online at voters.eci.gov.in or visit your local Electoral Registration Officer. Deadline is typically 10 days before polling.',
    action: 'Check your name on the voter list at electoralsearch.eci.gov.in and register if not listed.'
  },
  {
    id: 'constituencies',
    icon: '🗺️',
    label: 'Constituencies',
    title: '🗺️ Constituency Delimitation',
    desc: 'Electoral constituencies are defined geographic areas. Each constituency elects one representative. The Delimitation Commission periodically redraws boundaries based on census data.',
    action: 'Find your constituency and polling booth using the Voter Helpline app or 1950 helpline.'
  },
  {
    id: 'nominations',
    icon: '🏛️',
    label: 'Nominations',
    title: '🏛️ Candidate Nominations',
    desc: 'Candidates file nomination papers with the Returning Officer. Nominations are scrutinized, and candidates can withdraw within a specified period. Final candidate lists are published.',
    action: 'Research candidates in your constituency — check their affidavits on the ECI website.'
  },
  {
    id: 'campaigns',
    icon: '📣',
    label: 'Campaigns',
    title: '📣 Election Campaigns',
    desc: 'Candidates and parties campaign to win voter support through rallies, advertisements, and door-to-door outreach. The Model Code of Conduct governs campaign behavior to ensure fair elections.',
    action: 'Evaluate candidates based on their track record and manifesto, not just party affiliation.'
  },
  {
    id: 'silence',
    icon: '🚫',
    label: 'Silence Period',
    title: '🚫 Campaign Silence Period',
    desc: 'Campaigning is prohibited 48 hours before polling begins. This allows voters to make independent decisions without last-minute influence. Violations can lead to disqualification.',
    action: 'Use this time to finalize your voting decision based on research, not campaign noise.'
  },
  {
    id: 'polling',
    icon: '🗳️',
    label: 'Polling Day',
    title: '🗳️ Polling Day',
    desc: 'Voters visit their assigned polling booth with valid ID (Voter ID, Aadhaar, Passport, etc.). You cast your vote on an Electronic Voting Machine (EVM). A VVPAT slip confirms your choice.',
    action: 'Bring your Voter ID or any approved photo ID. Vote early to avoid queues. Your vote is secret.'
  },
  {
    id: 'counting',
    icon: '📊',
    label: 'Counting',
    title: '📊 Vote Counting',
    desc: 'EVM votes are counted under strict supervision of election officials, candidates, and their agents. VVPAT slips are verified for a random sample of EVMs to ensure accuracy.',
    action: 'Follow official ECI results — avoid unofficial sources that may spread misinformation.'
  },
  {
    id: 'results',
    icon: '🏆',
    label: 'Results',
    title: '🏆 Election Results',
    desc: 'The candidate with the most votes in each constituency wins (First Past The Post system). Results are declared by the Returning Officer and published on the ECI website.',
    action: 'Hold your elected representative accountable — engage with them on local issues.'
  }
];

/** @type {string|null} Currently active phase ID */
let activePhaseId = null;

/**
 * Initialize the election timeline component.
 */
export function initTimeline() {
  const tablist = document.getElementById('timeline-tablist');
  const detailArea = document.getElementById('timeline-detail-area');
  const progressLine = document.getElementById('timeline-progress');

  if (!tablist || !detailArea) return;

  // Build nodes
  TIMELINE_PHASES.forEach((phase) => {
    const node = createTimelineNode(phase);
    tablist.appendChild(node);
  });

  // Build detail panels
  TIMELINE_PHASES.forEach((phase) => {
    const panel = createTimelinePanel(phase);
    detailArea.appendChild(panel);
  });

  // Click delegation on tablist
  tablist.addEventListener('click', (e) => {
    const btn = e.target.closest('[role="tab"]');
    if (!btn) return;
    activatePhase(btn.dataset.phase, btn, progressLine);
  });

  // Keyboard navigation between tabs
  tablist.addEventListener('keydown', (e) => {
    const buttons = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      buttons[(current + 1) % buttons.length].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      buttons[(current - 1 + buttons.length) % buttons.length].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.activeElement.click();
    }
  });
}

/**
 * Activate a timeline phase — expand its panel, highlight its node.
 * @param {string} phaseId
 * @param {HTMLElement} btn
 * @param {HTMLElement|null} progressLine
 */
function activatePhase(phaseId, btn, progressLine) {
  const isSame = activePhaseId === phaseId;

  // Deactivate all
  TIMELINE_PHASES.forEach((p) => {
    const panel = document.getElementById(`phase-${p.id}-panel`);
    const nodeBtn = document.getElementById(`phase-${p.id}-tab`);
    const nodeEl = nodeBtn?.closest('.timeline__node');

    if (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('hidden', '');
    }
    nodeBtn?.setAttribute('aria-selected', 'false');
    nodeEl?.classList.remove('timeline__node--active');
  });

  if (isSame) {
    activePhaseId = null;
    updateProgressBar(progressLine, -1);
    return;
  }

  // Activate selected
  activePhaseId = phaseId;
  const panel = document.getElementById(`phase-${phaseId}-panel`);
  const nodeEl = btn.closest('.timeline__node');

  if (panel) {
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => panel.classList.add('is-open'));
    // Scroll into view on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  btn.setAttribute('aria-selected', 'true');
  nodeEl?.classList.add('timeline__node--active');

  const activeIndex = TIMELINE_PHASES.findIndex((p) => p.id === phaseId);
  updateProgressBar(progressLine, activeIndex);
}

/**
 * Update the progress bar fill width.
 * @param {HTMLElement|null} progressLine
 * @param {number} activeIndex - -1 to reset
 */
function updateProgressBar(progressLine, activeIndex) {
  if (!progressLine) return;
  if (activeIndex < 0) {
    progressLine.style.width = '0%';
    return;
  }
  const total = TIMELINE_PHASES.length - 1;
  const pct = total > 0 ? (activeIndex / total) * 100 : 0;
  progressLine.style.width = `${pct}%`;
}

/**
 * Create a timeline node button element.
 * @param {{id: string, icon: string, label: string}} phase
 * @returns {HTMLElement}
 */
function createTimelineNode(phase) {
  const node = document.createElement('div');
  node.className = 'timeline__node';

  const btn = document.createElement('button');
  btn.className = 'timeline__node-btn';
  btn.setAttribute('role', 'tab');
  btn.setAttribute('id', `phase-${phase.id}-tab`);
  btn.setAttribute('aria-selected', 'false');
  btn.setAttribute('aria-controls', `phase-${phase.id}-panel`);
  btn.dataset.phase = phase.id;

  const iconEl = document.createElement('div');
  iconEl.className = 'timeline__node-icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.textContent = phase.icon;

  const labelEl = document.createElement('span');
  labelEl.className = 'timeline__node-label';
  labelEl.textContent = phase.label;

  btn.appendChild(iconEl);
  btn.appendChild(labelEl);
  node.appendChild(btn);

  return node;
}

/**
 * Create a timeline detail panel element.
 * @param {{id: string, title: string, desc: string, action: string}} phase
 * @returns {HTMLElement}
 */
function createTimelinePanel(phase) {
  const panel = document.createElement('div');
  panel.className = 'timeline__panel';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('id', `phase-${phase.id}-panel`);
  panel.setAttribute('aria-labelledby', `phase-${phase.id}-tab`);
  panel.setAttribute('hidden', '');

  const inner = document.createElement('div');
  inner.className = 'timeline__panel-inner';

  const title = document.createElement('h3');
  title.className = 'timeline__panel-title';
  title.textContent = phase.title;

  const desc = document.createElement('p');
  desc.className = 'timeline__panel-desc';
  desc.textContent = phase.desc;

  const action = document.createElement('p');
  action.className = 'timeline__panel-action';
  action.textContent = phase.action;

  inner.appendChild(title);
  inner.appendChild(desc);
  inner.appendChild(action);
  panel.appendChild(inner);

  return panel;
}
