# كتابي التفاعلي — Platform Completion Roadmap

> **Project**: Interactive Arabic Reading Platform for Dyslexic Children (Ages 6–9)  
> **Current State**: Functionally complete UI + Supabase backend, but not production-ready  
> **Goal**: Polished, secure, scalable educational SaaS used by schools and families  
> **Target Launch**: Public beta after Phase 3

---

## AUDIT SUMMARY

### What Needs to Be FIXED (Bugs & Broken Things)

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | Audio system incomplete — MP3 files missing, Web Speech fallback removed | 🔴 Critical | `core.js`, `audio-manager.js`, `reading.js` |
| 2 | Silent auth failures — errors not shown to user | 🔴 Critical | `landing-auth.js`, `supabase-auth.js` |
| 3 | No React error boundary — one crash kills the entire app | 🔴 Critical | `app.js` |
| 4 | Database errors swallowed silently (only console.warn) | 🔴 Critical | `supabase-data.js` |
| 5 | No input validation on auth forms (no email format check, no password strength) | 🔴 Critical | `landing-auth.js` |
| 6 | XSS possible via `buildGameContext()` — no sanitization of user-derived text | 🔴 Critical | `app.js` |
| 7 | Confetti DOM nodes leak — 40 nodes per call, no cleanup guard | 🟡 High | `core.js` |
| 8 | Reading audio highlighting is fake — timing is `text.length * 50ms` (inaccurate) | 🟡 High | `reading.js` |
| 9 | Game inputs not bounded — invalid values can award stars | 🟡 High | `games-1.js` |
| 10 | No loading skeletons — blank screens during data fetch | 🟡 High | `child-dashboard.js`, `app.js` |
| 11 | Diagnostic and IQ test components not visible/accessible in routing | 🟡 High | `app.js` |
| 12 | Font size change doesn't persist across sessions | 🟢 Medium | `core.js` |
| 13 | Error messages in English inside an Arabic-only app | 🟢 Medium | `supabase-auth.js` |
| 14 | No "forgot password" flow | 🟢 Medium | `landing-auth.js` |
| 15 | Supabase credentials hardcoded in client — should be environment variables | 🔴 Critical | `supabase-client.js` |

---

### What Needs to Be UPGRADED (Existing Things, Better Version)

| Component | Current State | Upgrade To |
|-----------|--------------|-----------|
| Build system | No build step, Babel standalone (+200KB overhead) | **Vite** — fast HMR, tree-shaking, <50ms builds |
| State management | Scattered `useState` prop-drilling in `app.js` (649 lines) | **Zustand** — minimal, React-friendly global store |
| Auth UX | Basic email/password, no verification, no reset | Email verify, password reset, strength meter |
| Parent Dashboard | Minimal (no edit, delete, sort, export) | Full child management, PDF reports |
| Content Library | Hard-coded JS array in `library-data.js` | Supabase table — live CMS updates without deploys |
| CSS architecture | Global stylesheet, no theming system | CSS custom properties + theme tokens |
| Error handling | `console.warn` + silent failures | Toast notification system + error boundaries |
| Audio sync in reading | Estimated timer (inaccurate) | WebVTT caption tracks or character-level timing map |
| Game difficulty | Fixed difficulty per game | Dynamic difficulty based on child's diagnostic score |
| Progress tracking | Stars only | Multi-dimensional: stars + time spent + error rate + streak |

---

### What Needs to Be REPLACED (Current Approach is Wrong)

| What | Replace With | Why |
|------|-------------|-----|
| Babel CDN standalone | Vite + npm build pipeline | 200KB overhead, no tree-shaking, slow cold load |
| Hard-coded Supabase keys in JS | `.env` variables + Vercel environment settings | Security best practice |
| `playAll()` timer hack in `reading.js` | WebVTT timing file per text | Real sync vs. fake sync |
| ASCII art letter shapes in Game 5 | SVG letter anatomy diagrams | Crisp at any size, scriptable |
| Monolithic `app.js` (649 lines) | Split: `Router.js` + `store/` + `hooks/` | Maintainable, testable, readable |
| No tests → manual QA only | Vitest + React Testing Library + Playwright | Catch regressions automatically |
| `supabase-data.js` scattered error handling | Centralized `ApiClient` wrapper with retry + toast | Consistent behavior across all DB calls |
| System default fonts | **Noto Naskh Arabic** (dyslexia-optimized Arabic) | Research-backed better readability |

---

### What Needs to Be BUILT (Does Not Exist Yet)

| Feature | Priority | Notes |
|---------|---------|-------|
| Web Speech API TTS fallback (Arabic) | 🔴 Must-have | Until MP3 library is recorded |
| Error boundary component | 🔴 Must-have | Wrap all pages |
| Toast notification system | 🔴 Must-have | User feedback for save/load/error |
| Password reset flow | 🔴 Must-have | Supabase magic link |
| Teacher/Admin dashboard | 🟡 High | Manage students, add content |
| CMS for content (texts, games) | 🟡 High | Add texts without code changes |
| Child profile: avatar + settings | 🟡 High | Engagement and personalization |
| PDF progress report (parent) | 🟡 High | Print/share with teacher |
| Service Worker + offline mode | 🟡 High | Works in low-bandwidth areas |
| CI/CD pipeline (GitHub Actions) | 🟡 High | Auto test + deploy on push |
| Analytics dashboard (admin) | 🟢 Nice | Aggregate learning outcomes |
| Multiplayer spelling challenge | 🟢 Nice | Peer motivation |
| Dyslexia screening questionnaire | 🟡 High | More rigorous than current diagnostic |
| Achievement badges + unlockable themes | 🟢 Nice | Long-term engagement |
| Sentry error monitoring | 🟡 High | Production issue detection |

---

---

# 10-PHASE COMPLETION PLAN

---

## PHASE 1 — Security & Stability Foundation
**Duration**: 1 week  
**Goal**: Fix critical blockers — nothing ships until this is done

### Tasks
- [ ] Move Supabase URL + API key to `.env` + Vercel environment variables
- [ ] Verify Supabase Row Level Security (RLS) policies are correctly configured for every table
- [ ] Add React `ErrorBoundary` component wrapping every top-level view
- [ ] Sanitize all user-generated input before passing to `buildGameContext()`
- [ ] Translate all error strings in `supabase-auth.js` to Arabic
- [ ] Add input validation to auth form: email format regex, password min-length, name length
- [ ] Add auth rate limiting (Supabase built-in or client-side debounce)
- [ ] Fix confetti DOM leak — add `isAnimating` guard in `fireConfetti()`
- [ ] Validate game inputs (count range checks, drag target checks) in all 9 games
- [ ] Add `console.error` → Sentry logging bridge (setup Sentry free tier)

### Deliverable
A codebase that will not leak credentials, crash silently, or accept malicious input.

---

## PHASE 2 — Audio System
**Duration**: 1–2 weeks  
**Goal**: Children can hear every letter, word, and text

### Tasks
- [ ] Re-enable Web Speech API TTS in `core.js` `speak()` — Arabic (`lang: 'ar-SA'`)
- [ ] Create a unified `AudioService` that tries: (1) MP3 file, (2) Web Speech fallback, (3) silent
- [ ] Record or source 28 Arabic letter MP3 files + 10 common word sounds
- [ ] Build `readingTimingMap.js` — per-text word timing arrays (milliseconds) for accurate highlight sync
- [ ] Replace fake `text.length * 50ms` timer in `reading.js` with real timing map
- [ ] Add visual progress bar to reading page (time-based fallback if no timing map)
- [ ] Test all 9 games: confirm audio plays on every interaction that requires it
- [ ] Add mute toggle in TopBar that persists to localStorage

### Deliverable
Children hear Arabic letters and words in every game. Reading page has synchronized word highlighting.

---

## PHASE 3 — Error Handling & User Feedback
**Duration**: 1 week  
**Goal**: Zero silent failures; every operation gives visible feedback

### Tasks
- [ ] Build `Toast` component (success/error/info, RTL-positioned top-right)
- [ ] Wrap all Supabase calls in a centralized `ApiClient` with automatic toast on failure
- [ ] Add retry logic (3 attempts with exponential backoff) for DB reads on network error
- [ ] Add loading skeleton components for: child dashboard, parent dashboard, library
- [ ] Add "Saved!" confirmation animation when progress is recorded
- [ ] Build "Password Reset" flow using Supabase magic link (button in auth page)
- [ ] Build "Forgot Password" email form
- [ ] Add email verification gate (Supabase email confirm) with resend option

### Deliverable
App never silently fails. Users always know what happened and what to do next.

---

## PHASE 4 — Build Toolchain Migration
**Duration**: 1 week  
**Goal**: Replace CDN-only Babel with Vite — proper module system, fast builds

### Tasks
- [ ] Initialize `package.json` with npm, install `vite`, `react`, `react-dom`, `@supabase/supabase-js`
- [ ] Convert all `.js` files using JSX to use proper `.jsx` extensions
- [ ] Replace CDN `<script>` tags in `index.html` with Vite entry point
- [ ] Set up `.env.local` for Supabase credentials (referenced as `import.meta.env.VITE_*`)
- [ ] Configure `vite.config.js`: RTL build, asset optimization, chunk splitting per game
- [ ] Move library data to a JSON file → later to Supabase
- [ ] Set up Tailwind CSS (optional) or organize CSS into component-scoped modules
- [ ] Verify all existing functionality still works after migration
- [ ] Set up ESLint + Prettier with Arabic-friendly config

### Deliverable
App builds in <500ms, ships 60% smaller bundle, imports work correctly.

---

## PHASE 5 — State Management Refactor
**Duration**: 1–2 weeks  
**Goal**: Break `app.js` apart; replace prop drilling with a clean global store

### Tasks
- [ ] Install **Zustand** (`npm install zustand`)
- [ ] Extract state slices: `useAuthStore`, `useProgressStore`, `useSettingsStore`, `useNavigationStore`
- [ ] Move all Supabase calls out of `app.js` into store actions
- [ ] Split `app.js` into: `App.jsx` (routing only) + `pages/` folder + `hooks/` folder
- [ ] Create custom hooks: `useChildProgress()`, `useGameContext()`, `useAudio()`
- [ ] Update all game components to read from store (no prop drilling)
- [ ] Move font size preference to `useSettingsStore` → persist via localStorage
- [ ] Add `React.memo` to game components to prevent unnecessary re-renders
- [ ] Profile app with React DevTools — fix any remaining unnecessary renders

### Deliverable
`app.js` shrinks from 649 lines to <100 lines. Components are independently testable.

---

## PHASE 6 — Content & Library Management
**Duration**: 1–2 weeks  
**Goal**: Content managed from a database, not hard-coded JavaScript

### Tasks
- [ ] Create Supabase tables: `books`, `texts`, `sentences`, `words`
- [ ] Migrate `library-data.js` content into database (SQL seed script)
- [ ] Build `ContentService` for fetching books/texts/sentences
- [ ] Add caching layer (React Query or SWR) for content fetching
- [ ] Build basic **Admin CMS page** (password-protected route): add/edit/delete books + texts
- [ ] Add `difficulty_level` (1–5) column to texts table
- [ ] Add `reading_level` (Lexile equivalent) tags to texts
- [ ] Build **Teacher Dashboard**: view assigned students, assign specific texts
- [ ] Add content lock logic: text only available after prerequisite text completed
- [ ] Replace book emoji icons with proper SVG illustrations (7 books)

### Deliverable
Texts can be added, edited, and organized from a web interface — no code changes needed.

---

## PHASE 7 — Child Experience Polish
**Duration**: 2 weeks  
**Goal**: Delight children — engaging, personalized, rewarding

### Tasks
- [ ] Replace system font with **Noto Naskh Arabic** (Google Fonts, free, dyslexia-friendly)
- [ ] Build **Child Profile** page: avatar picker (16 animal avatars), display name, age
- [ ] Replace hardcoded star counter with animated star collection shelf
- [ ] Build **Achievement Badge System**: 20 badges (First Star, Speed Reader, Perfect Game, etc.)
- [ ] Add progress milestone animations: 10 stars = confetti parade, 50 stars = unlock new theme
- [ ] Add 3 color themes children can unlock: Ocean Blue, Desert Gold, Forest Green
- [ ] Build **Streak tracker**: daily login streak shown on dashboard
- [ ] Add "Last read" bookmark: shows child exactly where they left off
- [ ] Build **My Library** section: bookshelf view showing completed/in-progress/locked books
- [ ] Add victory screen between reading and games: animated transition

### Deliverable
Children look forward to opening the app. Parents report increased engagement.

---

## PHASE 8 — Parent Dashboard & Reporting
**Duration**: 1–2 weeks  
**Goal**: Parents and teachers have deep insight into learning progress

### Tasks
- [ ] Rebuild Parent Dashboard with 4 tabs: Overview, Progress, Diagnostic, Settings
- [ ] **Overview tab**: stars this week, texts completed, time spent, active streak
- [ ] **Progress tab**: per-book progress bars, per-game accuracy charts (Chart.js or Recharts)
- [ ] **Diagnostic tab**: dyslexia screening result, areas of strength, areas needing support
- [ ] **Settings tab**: edit child name, toggle notifications, set weekly goal
- [ ] Build **PDF Report Generator**: weekly summary printable for teacher meetings
- [ ] Add **multi-child management**: add, rename, delete, switch between child accounts
- [ ] Implement **Email Digest**: weekly progress summary sent to parent (Supabase Edge Function + Resend.com)
- [ ] Build **Comparison view**: child's progress vs. age-group averages (anonymized)
- [ ] Add **Learning Goals** feature: parent sets a weekly star/text target

### Deliverable
Parents can share a PDF report with teachers. Weekly emails keep parents informed.

---

## PHASE 9 — Testing, Performance & CI/CD
**Duration**: 2 weeks  
**Goal**: Code that can be refactored safely; deploys that don't break things

### Tasks
- [ ] Install **Vitest** + **React Testing Library**
- [ ] Write unit tests for all 9 games: correct answer awards star, wrong answer does not
- [ ] Write unit tests for `AudioService`: MP3 path → Web Speech fallback logic
- [ ] Write unit tests for `ApiClient`: retry logic, error toast trigger
- [ ] Write integration tests for auth flow: signup → login → profile loaded
- [ ] Write integration tests for progress flow: read text → games → stars saved to DB
- [ ] Install **Playwright** for E2E tests: child completes Book 1 end-to-end
- [ ] Set up **GitHub Actions** CI: lint + test on every PR
- [ ] Set up **GitHub Actions** CD: auto-deploy to Vercel on merge to `main`
- [ ] Add staging environment (Vercel preview deployments per branch)
- [ ] Run **Lighthouse CI** in pipeline: enforce score >80 Performance, >90 Accessibility
- [ ] Set up **Sentry** release tracking: source maps uploaded on each deploy

### Deliverable
Zero-downtime deploys. Every push is tested. Regressions caught before users see them.

---

## PHASE 10 — Scale, Accessibility & Launch
**Duration**: 2 weeks  
**Goal**: Ready for public launch — schools, clinics, and families

### Tasks

**Accessibility Audit**
- [ ] Run WCAG 2.1 AA audit with `axe-core` on every page
- [ ] Add full keyboard navigation to all games (Tab + Enter + Arrow keys)
- [ ] Verify screen reader compatibility (NVDA + Windows, VoiceOver + iOS)
- [ ] Add `aria-label` to all interactive elements
- [ ] Verify color contrast ratios ≥ 4.5:1 for all text
- [ ] Add `prefers-reduced-motion` support for animations

**Performance**
- [ ] Lazy-load each game module (`React.lazy` + `Suspense`)
- [ ] Add Service Worker for offline support (texts + games work without internet)
- [ ] Optimize all SVG illustrations (SVGO)
- [ ] Add CloudFlare CDN in front of Vercel (free plan)
- [ ] Ensure first contentful paint < 1.5s on 3G mobile

**Launch Preparation**
- [ ] Write Arabic privacy policy + terms of service (COPPA-compliant, children's data)
- [ ] Set up Supabase Pro plan ($25/mo) for production SLAs
- [ ] Set up domain: `kitabi.app` or similar
- [ ] Create landing page with: demo video, features, pricing, contact form
- [ ] Build **Pricing Page**: Free (1 child, 3 books) / Family $5/mo (5 children) / School $30/mo
- [ ] Set up **Stripe** payment integration via Supabase + Edge Functions
- [ ] Soft launch: 50 beta families, 3 schools
- [ ] Post-launch: Gather NPS scores, fix top 5 complaints
- [ ] Submit to Arabic app directories and dyslexia NGO networks

### Deliverable
A public product that passes accessibility standards, handles real school traffic, and can charge for subscriptions.

---

## PHASE SUMMARY

| Phase | Theme | Duration | Priority |
|-------|-------|----------|----------|
| 1 | Security & Stability | 1 week | 🔴 Must |
| 2 | Audio System | 1–2 weeks | 🔴 Must |
| 3 | Error Handling & Feedback | 1 week | 🔴 Must |
| 4 | Build Toolchain (Vite) | 1 week | 🟡 High |
| 5 | State Management Refactor | 1–2 weeks | 🟡 High |
| 6 | Content & Library CMS | 1–2 weeks | 🟡 High |
| 7 | Child Experience Polish | 2 weeks | 🟡 High |
| 8 | Parent Dashboard & Reports | 1–2 weeks | 🟡 High |
| 9 | Testing, Performance & CI/CD | 2 weeks | 🟡 High |
| 10 | Scale, Accessibility & Launch | 2 weeks | 🟡 High |

**Total Estimated Time**: 13–17 weeks (solo developer), 6–8 weeks (2-person team)

---

## TECHNOLOGY STACK — END STATE

| Layer | Current | Target |
|-------|---------|--------|
| Build | Babel CDN standalone | **Vite 5** |
| Framework | React 18 (CDN) | **React 19** (npm) |
| State | useState prop-drilling | **Zustand** |
| Styling | Global CSS | **CSS Modules + Noto Naskh Arabic** |
| Backend | Supabase | **Supabase** (unchanged, hardened) |
| Auth | Supabase Auth basic | **Supabase Auth** + email verify + password reset |
| Payments | None | **Stripe** via Supabase Edge Functions |
| Analytics | None | **Plausible** (privacy-friendly, Arabic-market legal) |
| Monitoring | None | **Sentry** |
| Testing | None | **Vitest** + **Playwright** |
| CI/CD | None | **GitHub Actions** + **Vercel** |
| Fonts | System Arabic | **Noto Naskh Arabic** (Google Fonts) |
| Data fetching | Direct Supabase SDK | **TanStack Query** (caching, sync) |

---

## CRITICAL PATH (Minimum Viable Launch)

If forced to launch in 4 weeks, do only these in order:

1. **Phase 1** (Security) — non-negotiable
2. **Phase 2** (Audio) — app is silent without this
3. **Phase 3** (Error feedback) — parents will abandon app without it
4. Subset of **Phase 7** (Font + avatar + badges) — child engagement
5. Subset of **Phase 8** (Parent overview tab + PDF) — parent retention

Everything else becomes post-launch iteration.

---

*Last updated: 2026-05-02*
