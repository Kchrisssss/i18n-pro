---
name: i18n-pro
description: Advanced internationalization skill for vibe coding. Supports static JSON locales and Supabase-backed dynamic translations with an admin panel.
---

# i18n-pro Skill

This skill provides a scalable, token-efficient internationalization system for any web app. It follows the **Externalized Strings** pattern so that UI/logic changes never require re-translating existing content — only new keys are ever handed to an AI for translation.

Works with: vanilla HTML, React, Vue, Next.js, SvelteKit, or any framework that can load JSON and apply DOM attributes.

---

## 🏗 System Architecture

1. **Placeholder Pattern**: Use `data-i18n="key.path"` on HTML elements. The runtime populates text from the active locale.
2. **Fallback Strategy**: Always include the English (primary) text inline as a fallback for SSR, bots, and before JS loads.
3. **Storage Modes**:
   - **Static Mode** — JSON files in `/locales/{lang}.json`. Best for most projects.
   - **Dynamic Mode** — Supabase `translations` table. Best for content that changes frequently or is managed by non-developers.
4. **Admin UI**: `/admin/index.html` — edit and download locale files visually, without touching code.

---

## 🚀 Setup Instructions

### File Structure
```
your-project/
├── lib/
│   └── i18n.js          # Runtime (copy from scaffold)
├── locales/
│   ├── en.json          # Primary locale (always the master)
│   └── {lang}.json      # Additional languages
└── admin/
    └── index.html       # Translation admin panel
```

### Implementation Rules
- **Never hardcode** user-facing text directly in HTML once the baseline is set.
- **Always use** `data-i18n="key"` for any string that needs to be translated.
- When adding a new string, append to `en.json` **first**, then generate other languages only for those new keys.
- Keep keys hierarchical and descriptive: `nav.home`, `hero.title`, `footer.copyright`.

---

## 🛠 Usage Commands

### Start a new i18n project (greenfield)
```
Scaffold i18n setup for this project using [static|supabase] mode.
```
The agent will: copy `lib/i18n.js`, create `locales/en.json`, wire up `data-i18n` attributes on all UI strings.

### Retrofit an existing all-English project
```
Retrofit this project with i18n using the i18n-pro skill (static mode).
```
**Agent workflow for retrofit:**
1. **Audit** — scan all `.html` / component files and list every user-facing string found
2. **Extract** — move all strings into `locales/en.json` with logical key names
3. **Wire** — replace inline text with `data-i18n="key"` attributes (text stays as inline fallback)
4. **Copy runtime** — add `lib/i18n.js` and call `initI18n()` in the app entry point
5. **Generate translations** — for each target language, call:
   ```
   Translate all keys in locales/en.json into [lang] and save as locales/[lang].json
   ```
6. **Add language switcher** — add UI buttons that call `loadLanguage(lang)`

### Sync keys (keep locales in sync after adding new strings)
```
Identify all data-i18n keys in the project and ensure they exist in en.json.
```

### Translate missing keys only
```
Translate all missing keys in [lang].json based on en.json values.
```

---

## 💾 Supabase Schema (Dynamic Mode only)

Use this when translations need to be edited live by non-developers, or when the project already uses Supabase.

```sql
create table public.translations (
  id uuid default gen_random_uuid() primary key,
  key text not null,
  lang text not null,
  value text not null,
  updated_at timestamp with time zone default now(),
  unique(key, lang)
);

-- Enable Row Level Security
alter table public.translations enable row level security;

-- Allow any visitor to read translations
create policy "Public read"
  on public.translations for select
  using (true);

-- Restrict writes to authenticated users (or service role)
create policy "Auth write"
  on public.translations for all
  using (auth.role() = 'authenticated');
```

Then initialise with Supabase mode:
```js
import { initI18n } from './lib/i18n.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
await initI18n({
  mode: 'supabase',
  supabaseConfig: { client: supabase, table: 'translations' }
});
```

---

## 📜 Admin Panel Rules

The admin panel at `/admin/index.html`:
- Fetches all keys from the master locale (`en.json`) and shows them side-by-side with editable target fields.
- Highlights **missing** translations in red.
- **💾 Save** — uses the File System Access API (`window.showDirectoryPicker`) to write `[lang].json` directly into the chosen `locales/` directory. No download-and-replace needed.
- **⬇ Download dropdown** — fallback download menu with two options:
  - *Target language JSON* — exports the current translated file.
  - *English master JSON* — exports `en.json` as-is.
- **⇄ Copy EN to empty** — fills every blank target field with its English source text for a quick translator baseline.
- **Unsaved-changes tracking** — a pulsing amber dot appears next to the logo when there are unsaved edits. The browser `beforeunload` event and an in-page nav-guard modal prevent accidental data loss when switching languages or closing the tab.
- **Progress bar** — shows translated percentage alongside the filter chips.
- **Section filter** — a `<select>` in the stats bar lets translators focus on one key-prefix group at a time. Friendly labels are configured via the `SECTION_LABELS` object at the top of the `<script>` block.
- **`SECTION_LABELS` config** — map key prefixes to display names (e.g. `nav → 'Navigation'`). Edit this object to match your project's key structure.

---

## 🌐 Choosing a Mode

| | Static Mode | Dynamic Mode (Supabase) |
|---|---|---|
| **Best for** | Most projects | Apps with changing copy or non-dev editors |
| **Storage** | JSON files in repo | Supabase database table |
| **Deployment** | Changes need a redeploy | Changes are live immediately |
| **Admin panel** | Download & commit JSON | Saves directly to Supabase |
| **Complexity** | Low | Medium (requires Supabase project) |
