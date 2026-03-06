# i18n-pro — AI-Powered Internationalization Skill

A lightweight, framework-agnostic i18n scaffold designed for **vibe coding** (AI-assisted development). Drop it into any project and let the AI handle the translation workflow end-to-end.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is this?

`i18n-pro` is a **skill** for AI coding assistants (Antigravity, Cursor, GitHub Copilot Workspace, etc.). It provides:

- A **runtime** (`lib/i18n.js`) — loads locale JSON or fetches from Supabase, applies translations to the DOM via `data-i18n` attributes.
- A **locale scaffold** (`locales/en.json`) — the English master file. Translations for other languages are generated from this.
- An **admin panel** (`admin/index.html`) — a visual UI for editing and downloading locale files without touching code.
- A **skill definition** (`.agent/skills/i18n-pro/SKILL.md`) — read by the AI agent to understand exactly how to scaffold, retrofit, and maintain translations.

**Supported project types:** Vanilla HTML, React, Vue, Next.js, SvelteKit — anything that can load JSON and manipulate the DOM.

---

## Folder Structure

```
i18n_translation_scaffold/       ← This repo
├── .agent/
│   └── skills/
│       └── i18n-pro/
│           └── SKILL.md         ← The AI agent reads this
├── admin/
│   └── index.html               ← Visual translation editor
├── lib/
│   └── i18n.js                  ← Runtime (copy into your project)
├── locales/
│   ├── en.json                  ← English master locale
│   └── fr.json                  ← Example French locale
├── index.html                   ← Demo page showing the runtime in action
└── README.md                    ← You are here
```

---

## How to Install

**i18n-pro is a skill, not a package**. There is nothing to `npm install`.

### Step 1 — Copy the skill into your project

```bash
# From your project root:
cp -r path/to/i18n_translation_scaffold/.agent ./
```

Your project should now have:
```
your-project/
└── .agent/
    └── skills/
        └── i18n-pro/
            └── SKILL.md
```

That's it. The AI agent will automatically discover and use the skill.

### Step 2 — Tell the agent what to do

Open a chat with your AI assistant and use one of these prompts:

---

## Usage

### Greenfield project (starting from scratch)

```
Scaffold i18n setup for this project using static mode.
```

The agent will:
1. Create `lib/i18n.js` in your project
2. Create `locales/en.json` with keys for all existing UI strings
3. Add `data-i18n="key"` attributes to all translatable elements
4. Wire `initI18n()` into your app entry point
5. Add a language switcher component

---

### Retrofitting an existing all-English project

This is the most common case — you built something in English and now want to add other languages.

```
Retrofit this project with i18n using the i18n-pro skill (static mode).
```

**What the agent does, step by step:**

| Step | Agent Action |
|------|-------------|
| 1. Audit | Scans all HTML/JSX/Vue files and lists every user-facing string |
| 2. Extract | Moves all strings into `locales/en.json` with logical key names |
| 3. Wire | Replaces inline text with `data-i18n="key"` attributes (original text stays as fallback) |
| 4. Runtime | Copies `lib/i18n.js` and calls `initI18n()` in the app entry point |
| 5. Translate | Generates `locales/[lang].json` for each target language |
| 6. Switcher | Adds a language switcher UI element |

> [!TIP]
> You don't need to describe your project structure — the agent audits it automatically.

---

### Add a new target language

```
Translate all keys in locales/en.json into Spanish and save as locales/es.json.
```

---

### Keep locales in sync after adding new strings

```
Identify all data-i18n keys in the project and ensure they exist in en.json.
```

```
Translate all missing keys in fr.json based on en.json values.
```

---

## Static vs. Supabase Mode

| | Static Mode | Dynamic Mode (Supabase) |
|---|---|---|
| **Best for** | Most projects | Apps with frequently changing copy or non-developer editors |
| **Storage** | JSON files committed to the repo | Supabase `translations` table |
| **To update** | Edit JSON → redeploy | Edit in admin panel → live immediately |
| **Complexity** | Zero external dependencies | Requires a Supabase project |

To use Supabase mode, tell the agent:

```
Scaffold i18n setup for this project using supabase mode.
```

The agent will create the database table (schema is in `SKILL.md`) and configure the runtime to fetch from Supabase.

---

## Admin Panel

Open `admin/index.html` in any web server (e.g. `npx serve .`).

The panel:
- Shows all keys from the English master alongside the target language
- Highlights **missing translations in red**
- Has a **Download JSON** button — download the edited file and commit it to `locales/`
- In Supabase mode, the **Save Changes** button writes directly to the database

---

## Key Concepts

### `data-i18n` attribute

```html
<!-- The key maps to a value in the active locale JSON -->
<!-- The inline text is the fallback (shown before JS loads / for bots) -->
<h1 data-i18n="hero.title">Welcome</h1>
<p data-i18n="hero.subtitle">The best app you've ever used.</p>
<input data-i18n="form.placeholder" placeholder="Enter your email">
```

### `t()` helper — use in JavaScript

```js
import { t } from './lib/i18n.js';

console.log(t('hero.title'));           // → "Welcome"
console.log(t('missing.key', 'Oops')); // → "Oops" (fallback)
```

### Switching languages at runtime

```js
import { loadLanguage } from './lib/i18n.js';
await loadLanguage('fr'); // fetches fr.json and re-renders all [data-i18n] elements
```

---

## Adding i18n to Your Own AI Skill Pack

If you maintain a set of AI skills, just copy the `.agent/skills/i18n-pro/` folder alongside your other skills. The agent discovers skills by reading all `SKILL.md` files in `.agent/skills/`.

---

## License

MIT — free to use, modify, and distribute.

---

## Contributing

PRs welcome. If you add support for a new framework (React hooks, Vue composables, etc.), please include an example in the `examples/` directory and update `SKILL.md` with the relevant usage command.
