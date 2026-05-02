# Suraksha 🗳️ — Election Literacy Assistant

> **Suraksha** (सुरक्षा) means *protection* in Hindi — symbolizing the protection of democratic rights through awareness.

A production-ready interactive web application that helps everyday citizens understand the Indian election process, voting timelines, steps, and rights in a fun, approachable, and interactive way.

---

## Features

- **Dual scrolling ticker banners** — pure CSS marquee, no JavaScript
- **Sticky navbar** with scroll blur effect and mobile hamburger drawer
- **Hero section** with CSS-only animated mascot and floating shapes
- **3-step How It Works** cards with staggered scroll animations
- **Interactive Election Timeline** — 9 phases, click to expand details, progress bar
- **AI Chat Assistant** (Suraksha Bot) — powered by Claude via server-side proxy
- **5-question Quiz** with instant feedback, confetti on completion, share score
- **Voter Rights & Rules** masonry card grid
- **Email notification signup** with real-time validation
- **FAQ accordion** with full keyboard navigation
- **Footer** with resource links

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript (no frameworks)
- **AI**: Anthropic Claude (`claude-sonnet-4-20250514`) via serverless proxy
- **Deployment**: Vercel (or Netlify)
- **Fonts**: Google Fonts — Baloo 2 + Nunito

## File Structure

```
suraksha/
├── index.html
├── css/
│   ├── tokens.css       ← CSS custom properties only
│   ├── base.css         ← reset, typography, global
│   ├── components.css   ← buttons, cards, badges, ticker, chat, quiz
│   ├── layout.css       ← grid, sections, spacing, responsive
│   └── animations.css   ← all keyframes (gated by prefers-reduced-motion)
├── js/
│   ├── main.js          ← init, IntersectionObserver, navbar, FAQ, form
│   ├── timeline.js      ← timeline tab/expand logic
│   ├── quiz.js          ← quiz state machine + confetti
│   ├── chatbot.js       ← API calls, chat UI rendering
│   └── utils.js         ← sanitize(), debounce(), trapFocus(), isValidEmail()
├── api/
│   └── chat.js          ← Vercel serverless proxy (API key stays server-side)
├── vercel.json
├── .env.example
└── .gitignore
```

## Setup & Deployment

### 1. Clone and configure

```bash
git clone <your-repo>
cd suraksha
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set the environment variable in the Vercel dashboard:
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: your key from [console.anthropic.com](https://console.anthropic.com)

### 3. Deploy to Netlify (alternative)

Rename `api/chat.js` export to use Netlify Functions format:

```js
export const handler = async (event) => { ... }
```

Then deploy via `netlify deploy --prod`.

## Accessibility

WCAG 2.1 AA compliant:
- Skip navigation link
- Full keyboard navigation (Tab, Shift+Tab, Enter, Space, arrow keys)
- Focus trap in chat dialog
- `aria-live` regions for quiz feedback and chat messages
- `aria-expanded`, `aria-controls`, `aria-selected` on interactive components
- All animations wrapped in `prefers-reduced-motion: no-preference`
- Minimum 44×44px touch targets
- Color contrast ≥ 4.5:1 for all text

## Security

- API key is **never** in any frontend file — only in server environment variables
- User input rendered with `textContent`, never `innerHTML`
- All external links use `rel="noopener noreferrer"`
- Security headers configured in `vercel.json`
- Chat history capped at last 10 messages

---

© 2026 Suraksha · Not affiliated with the Election Commission of India · For informational purposes only
