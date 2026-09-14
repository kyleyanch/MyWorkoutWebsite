# FitLife Hub — My Workout Website

A no-framework, personal strength-training companion: a 100-exercise library split
by muscle group, ready-to-run workout programs, a local-first workout tracker with
an Epley-based 1RM calculator, and a profile page for goals and weekly schedule.

Everything is static HTML/CSS/JS. All data lives in `exercises.json`; everything
you log stays in your browser's `localStorage` — no account, no backend.

## Current State

### Pages

| Page | What it does |
|------|--------------|
| `index.html` | Home — hero, "hub at a glance" stats, browse by muscle group |
| `chest.html` | Chest library — 15 exercises, training tips, sample routine, FAQ |
| `back.html` | Back library — 20 exercises, tips, sample routine, FAQ |
| `legs.html` | Legs library — 25 exercises, tips, sample routine, FAQ |
| `shoulders.html` | Shoulders library — 15 exercises, tips, sample routine, FAQ |
| `arms-core.html` | Arms & core library — 25 exercises, tips, sample routine, FAQ |
| `programs.html` | 4 ready-to-run splits (e.g. Push/Pull/Legs 6-day) with exercise order + sets/reps |
| `tracker.html` | Workout tracker — log sets, track volume, estimate 1RM |
| `profile.html` | Profile — goal, experience, days/week, weekly day schedule, progress slider |

### Features (in `app.js`)

- **1RM calculator** — Epley formula (`weight × (1 + reps/30)`), live on input.
- **Workout log** — add/remove/clear sets (exercise, sets, reps, weight), persisted in
  `localStorage` (`fitlife_log`). Summary tiles: total sets, volume (kg), unique
  exercises used, best estimated 1RM.
- **Profile** — name, goal (muscle/strength/endurance/general), experience, training
  days per week, toggleable day-of-week schedule, goal-progress slider, summary stats
  (`fitlife_profile`).
- **Exercise cards** — each page card shows difficulty, mechanics, movement type,
  primary/secondary muscles, accessories, a tip note, and a safety-level callout.

### Data model — `exercises.json`

100 exercises across 6 muscle groups (chest 15, back 20, legs 25, shoulders 15,
upper arms 15, core 10). Fields per exercise:

```
name, body_part, primary_muscle_group, secondary_muscle_group,
secondary_body_part, accessories[], training_type, movement_type,
mechanics, difficulty, safety_level, safety_level_reason, notes
```

### Stack & dependencies

- Vanilla HTML + CSS + JS — no framework, no build step, no bundler.
- [Web Awesome](https://webawesome.com) (`wa-*` components) via CDN + Google Fonts
  (Inter/Sora).
- No runtime fetch — exercise cards are hand-authored per page, sourced from
  `exercises.json`.

## Getting Started (local)

```sh
git clone https://github.com/kyleyanch/MyWorkoutWebsite.git
cd MyWorkoutWebsite
python -m http.server 8000     # or just open index.html
```

Open `http://localhost:8000`. No install required.

## Future / Suggested Plans

> Proposed roadmap — none of these are started yet. Personal practice project.

- **Phase 1 — Exercise visuals (recommended next).** Add animated illustrations to
  the exercise cards using [`bryllim/workout-guide`](https://github.com/bryllim/workout-guide):
  302 exercises, 906 transparent SVG frames (3 per exercise), plus a framework-neutral
  npm package (`@bryllim/workout-guide`) with `getExercise`, `searchExercises`, and
  `getAssetUrl`. Plan: build a name→slug mapper for the 100 local exercises, then
  render frames via CDN — no build step required.
- **Phase 2 — Search & filter parity.** Use `searchExercises` to add equipment /
  movement / muscle filters to the library pages, mirroring the JSON fields.
- **Phase 3 — Render exercise cards from data.** Replace the hand-authored per-page
  cards with data-driven rendering from `exercises.json` so pages stay in sync with
  the catalog automatically.

## Notes

- Workout log and profile are **local-only** — clearing browser storage clears your
  data (clear button included for the log).
- Weights are in kilograms.