# ReHub RD — Architecture, Next.js Decisions, and Pair-Programming Guide

**Purpose.** This document explains how the ReHub frontend is structured, how it uses Next.js 14 (App Router), and where we align with or intentionally diverge from common “industry standard” patterns. It is written for you and for AI-assisted pair programming so you can keep **low comprehension debt**: you should know *where* things live, *why* they are that way, and *what* to change when requirements evolve.

**Converting to PDF.** Export this Markdown from your editor (VS Code / Cursor: Markdown PDF extensions) or use a tool such as Pandoc:  
`pandoc docs/rehub-architecture-and-nextjs-decisions.md -o rehub-architecture.pdf`

---

## 1. Stack snapshot

| Layer | Choice |
|--------|--------|
| Framework | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS, shadcn-style UI primitives |
| Auth | NextAuth.js v4, Credentials provider, JWT sessions |
| i18n | next-intl (locale fixed to `es` for UI copy; keys and routes in English-oriented style) |
| Motion | Framer Motion (landing and some dashboard polish) |
| Fonts | `next/font/google` (Plus Jakarta Sans) |

---

## 2. Repository and App Router structure

**Industry norm:** Colocate routes under `app/`, shared UI under `components/`, server utilities under `lib/`, types under `types/`.

**What we do:**

- `src/app/` — Route segments: `page.tsx`, `layout.tsx`, API route handlers.
- `src/app/dashboard/*` — Authenticated area with a **single** `layout.tsx` that guards the whole tree.
- `src/components/` — Split by domain: `landing/`, `dashboard/`, `auth/`, `ui/`.
- `src/lib/` — Auth config, routes helpers, business logic (profile store, scenarios, guides).
- `messages/` — `es.json` plus split payloads such as `data-scenarios.json`, merged in `src/i18n/request.ts`.

**Why it’s fine:** This matches common Next.js 14 conventions. The extra split of large message files (`data-scenarios.json`) is a **maintainability** choice, not a framework requirement.

---

## 3. Routes and URLs

**Industry norm:** Stable, readable URLs; often English segments for APIs and admin; product may use locale prefixes (`/es/...`) for multilingual sites.

**What we do:**

- **Path segments are English** (`/dashboard/profile`, `/login`, `/register`).
- **Spanish** is reserved for **user-visible strings** (via next-intl), not for URL slugs.
- **Central definition:** `src/lib/routes.ts` exports `ROUTES` and helpers (`hrefResourcesGuide`, `hrefResourcesHash`, `hrefLoginCallback`).
- **Legacy Spanish paths** redirect in `next.config.js` (e.g. `/dashboard/perfil` → `/dashboard/profile`).

**Intentional tradeoff:** We do **not** use `[locale]` dynamic segments (e.g. `/es/dashboard`). The app is Spanish-first with one locale wired in `src/i18n/request.ts`. Adding English UI later would mean introducing a locale segment or subdomain strategy—planned work, not missing “by mistake.”

**Pairing tip:** Any new screen should add a constant to `ROUTES` and consume it in links and redirects, not hardcoded strings.

---

## 4. Authentication

**Industry norm for App Router:**

- **Middleware** (`middleware.ts`) to protect routes early, and/or
- **Server Components** calling `getServerSession` / Auth.js `auth()`, and/or
- **tRPC / server actions** with session checks.

**What we do:**

- **NextAuth** with **Credentials** provider and **JWT** sessions (`src/lib/auth.ts`).
- **Demo users** via env vars (`AUTH_DEMO_EMAIL`, `AUTH_DEMO_PASSWORD`) with static fallback—explicitly documented as **not** production-grade.
- **Route handler:** `src/app/api/auth/[...nextauth]/route.ts`.
- **Protection:** `src/app/dashboard/layout.tsx` calls `getServerSession`; if absent, `redirect(hrefLoginCallback(ROUTES.dashboard))`.

**No root `middleware.ts` today.**

**Why we skipped middleware (complexity tradeoff):**

- One layout already covers **all** `/dashboard/*` children with a single session check.
- Avoids duplicating auth logic between middleware matchers and layouts.
- **Caveat:** Anything outside `dashboard` that should be private must be guarded explicitly (layout, page, or future middleware).

**Industry gap to be aware of:** Credentials + JWT without a database is normal for prototypes; production usually adds OAuth providers, httpOnly cookies (NextAuth handles cookies), refresh strategy, and server-side user storage.

**Pairing tip:** When adding a new protected zone (e.g. `/admin`), either nest it under `dashboard` or add `middleware.ts` or a dedicated layout with the same session check pattern.

---

## 5. Internationalization (i18n)

**Industry norm:** ICU messages, locale in URL or cookie, server + client providers.

**What we do:**

- **next-intl** with `createNextIntlPlugin` in `next.config.js`.
- **Root layout** loads `getMessages()` and wraps with `NextIntlClientProvider`.
- **Copy** lives in `messages/es.json` and supplementary JSON merged in `src/i18n/request.ts` (e.g. scenario texts).
- **Server:** `getTranslations`; **client:** `useTranslations`.

**Tradeoff:** Single locale in config reduces routing complexity; industry “full i18n” often uses `app/[locale]/layout.tsx`. Our approach is a **deliberate simplification** until a second locale is required.

### 5.1 Source language vs. locale files

- **Application source** (`src/**/*.ts`, `src/**/*.tsx`): write **comments, identifiers, and structural copy** in **English**. Do not embed Spanish (or other end-user languages) as string literals in code.
- **User-visible strings** belong in **`messages/`** (and merged JSON such as `data-scenarios.json`), keyed with **English-oriented paths** (for example `dashboard.needs.selectorTitle`). The **values** in `es.json` are Spanish because that is the current UI locale; adding `en.json` later would supply English values without renaming keys.
- **Technical debt:** Some modules under `src/lib/` still hold long-form Spanish content (guides, plans). Treat migrating that text into `messages/` as ongoing cleanup so the codebase stays scannable in one language.

---

## 6. Data and persistence (important mental model)

**Industry norm:** Server or edge persistence (database, BaaS), minimal sensitive data on the client.

**What we do (pilot / demo):**

- Much “profile,” “follow-up,” and “account” state is **client-side** (e.g. `localStorage` via modules under `src/lib/*-store.ts`).

**Why:** Faster iteration for a pilot without backend coupling; fits “tooling + guidance” UX.

**Tradeoff:** This is **not** how a regulated health product would store PHI long term. It is a **complexity and cost** sacrifice: no sync across devices, no server audit trail, easy to clear data. Document this when pitching or auditing the product.

**Pairing tip:** Before changing storage, grep for `localStorage` / `sessionStorage` and read `profile-store`, `followup-store`, `account-store`.

---

## 7. Performance and Next.js optimization (audit)

### 7.1 Images (`next/image`)

**Industry recommendation:** Use `next/image` for raster assets to get automatic resizing, lazy loading, and modern formats where configured.

**Current state (audit):**

- The codebase does **not** use `next/image` in `src/` today. Marketing and dashboard rely heavily on **emoji**, **SVG/icons**, and **CSS**, not large photo assets.

**When to add `next/image`:**

- Hero photography, team photos, infographics, or partner logos under `public/` or remote URLs.
- Place files in `public/` or configure `images.remotePatterns` in `next.config.js` for external domains.

**Action:** No urgent change until you introduce weighty images; then wrap them in `<Image>` with explicit `width`/`height` or `fill` + `sizes`.

### 7.2 Code splitting and lazy loading

**Industry recommendation:** `next/dynamic` with `ssr: false` for heavy client-only modules; dynamic `import()` for large optional UI.

**Current state (audit):**

- No `dynamic()` or `React.lazy` usage was found under `src/`.

**Reasonable future uses:**

- Heavy chart libraries, rich text editors, or large dashboard tabs that not every user opens.
- Third-party widgets that block main thread.

**Tradeoff:** The bundle is still moderate (see recent `next build` output). Premature dynamic imports add indirection; we **defer** until bundle analysis (e.g. `@next/bundle-analyzer`) shows a win.

### 7.3 Fonts

**Aligned:** `next/font/google` in root layout—good for self-hosting font files and reducing layout shift when paired with CSS variables.

### 7.4 Metadata and SEO

**Aligned:** `generateMetadata` uses next-intl for title/description/keywords—appropriate for App Router.

### 7.5 Route handlers and caching

**Default:** Next.js 14 caching rules apply. API routes (`/api/auth/*`) are dynamic by nature.

**If you add** public marketing pages that rarely change, consider `fetch` cache options or `revalidate` where relevant.

---

## 8. Other Next.js–related decisions

| Topic | Our approach | Note |
|--------|----------------|------|
| **Layouts** | Root layout + `dashboard/layout` | Nested layouts match App Router docs. |
| **Redirects** | `next.config.js` `redirects` | Good for legacy Spanish URLs. |
| **Env vars** | `AUTH_*`, `NEXTAUTH_*` | Standard for NextAuth. |
| **Strict mode** | `reactStrictMode: true` | Helps catch unsafe effects in dev. |
| **Middleware** | Absent | Acceptable with layout-based auth; revisit if routes multiply. |

---

## 9. Alignment vs intentional divergence (summary)

| Area | Typical “industry” pattern | ReHub choice | Rationale |
|------|---------------------------|--------------|-----------|
| Protected routes | Middleware + RBAC | Layout + `getServerSession` | Simpler for one protected subtree (`/dashboard`). |
| i18n routing | `/[locale]/...` | Single locale, no segment | Less routing noise until second language ships. |
| Auth | OAuth + DB users | Credentials + JWT + demo user | Pilot speed; document migration path. |
| Persistence | Server DB | Client stores for demo | Lower backend complexity; not for PHI production. |
| Images | `next/image` everywhere | Not needed yet | Current UI is icon/emoji/CSS-heavy. |
| Code splitting | Dynamic imports for heavy deps | Eager imports for now | Bundle still acceptable; add when measured. |

---

## 10. Improvement backlog (prioritized for learning and product)

1. **Introduce `next/image`** when first real marketing assets land; add `sizes` for responsive layouts.
2. **Run bundle analysis** once the dashboard grows; then add **targeted** `dynamic()` imports.
3. **Optional `middleware.ts`** if you split auth zones (e.g. public app vs dashboard vs admin) and want one gate.
4. **Server persistence** when moving beyond pilot (API routes or separate backend + typed client).
5. **E2E tests** (Playwright) for login and critical dashboard flows—industry standard for regressions.

---

## 11. Pair programming with AI on this codebase (low comprehension debt)

Use this as a **checklist** when you or an AI agent change behavior:

1. **Route** — Is the path in `ROUTES`? Any new redirect in `next.config.js`?
2. **Auth** — Is the page under `dashboard/layout` or does it need its own guard?
3. **Copy** — Is the string in `messages/` (or merged JSON) with `useTranslations` / `getTranslations`?
4. **Scenario / guide data** — Structure in `src/lib/`; Spanish copy for scenarios in `messages/data-scenarios.json`.
5. **Client vs server** — Default to Server Components; add `"use client"` only when you need hooks, browser APIs, or NextAuth client session.
6. **Storage** — If it must survive refresh, trace `*-store.ts` and localStorage keys before refactoring.

**Debt control:** Ask for a short “why” in PR descriptions when diverging from this doc—future you (and AI) will re-read `lib/` faster.

---

## 12. Document maintenance

- Update this file when you add **middleware**, **locale segments**, **image domains**, or **production auth**.
- Version or date the PDF export if you distribute it to stakeholders.

---

*Generated as a living architecture note for the ReHub RD Next.js application.*
