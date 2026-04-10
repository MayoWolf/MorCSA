# MorCSA

MorCSA is a game-style AP Computer Science A study site built to feel more like a guided learning path than a static review sheet.

Live site: [MorCSA.netlify.app](https://morcsa.netlify.app)

The goal is simple: help a student move through APCSA in a clean, motivating way with pixel mentors, CED-aligned pathway bubbles, short teaching beats, source-backed questions, fill-in-the-blank Java, and an IDE-style practice flow.

## What MorCSA Is

MorCSA is designed around three ideas:

- teach first, then quiz
- keep the pathway linear and easy to follow
- make practice feel active instead of passive

Instead of dumping a whole course onto one screen, MorCSA splits the experience into:

1. `Home`: the full course roadmap
2. `Pathway`: the selected world/unit and its lesson bubbles
3. `Lesson`: one active subunit step at a time, with progress always visible

## What Is In The App Right Now

- 4 APCSA unit worlds
- 53 official CED subunits mapped into the pathway
- 16 lesson screens across the full course route
- a sticky bottom progress bar for each lesson flow
- one pixel mentor per core unit
- IDE-style fill-in-the-blank Java practice with run feedback
- source-backed Unit 1 practice tied to subunits `1.1` through `1.15`
- direct Unit 1 teaching-guide text and quote interludes inside the lesson flow
- Netlify deployment at [MorCSA.netlify.app](https://morcsa.netlify.app)

## What Makes It Different

Most APCSA tools do one of these:

- throw random questions at you
- give you a wall of notes
- feel like a mock exam from the first click

MorCSA is trying to do something more structured:

- show the course as a journey
- keep each subunit focused
- alternate between explanation, questions, and code reps
- make the learner feel progress as they move bubble by bubble

## Current Content Status

This repo is honest about where it is:

- Unit 1 is the most source-backed unit right now.
- Unit 1 subunits `1.1` to `1.15` are wired to uploaded practice packets and a detailed teaching guide.
- Units 2 to 4 already exist in the pathway and lesson system, but their source-backed packet treatment is not yet as deep as Unit 1.

That means the platform structure is already in place for the full course, and Unit 1 is the clearest example of the intended content quality.

## Learning Model

Each lesson can combine:

- a lesson launch step
- one or more official CED topic teaching steps
- source questions for the current subunit
- a mentor quote or teaching interlude
- IDE-style fill-in-the-blank Java
- wrap-up and progression to the next bubble

For Unit 1, the quote and concept cards now pull directly from the uploaded teaching guide rather than generic filler text.

## Course Structure

The current route is organized as:

- `Unit 1: Using Objects and Methods`
- `Unit 2: Selection and Iteration`
- `Unit 3: Class Creation`
- `Unit 4: Data Collections`

The pathway data is stored in `src/data/journey.ts`, where each lesson is linked to:

- its unit
- its mission
- its practice slice
- its official CED subunits

## Tech Stack

- React 19
- TypeScript
- custom esbuild-based dev and production scripts
- plain CSS
- Netlify for hosting

This project does not use Vite. It ships with a small custom build pipeline so the generated app works cleanly in `dist/` and deploys directly to Netlify.

## Run MorCSA Locally

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

The app will be available at:

```text
http://127.0.0.1:4173
```

Create a production build:

```bash
npm run build
```

Preview the built site locally:

```bash
npm run preview
```

## Deployment

MorCSA is configured for Netlify.

Relevant config:

- build command: `npm run build`
- publish directory: `dist`
- Node version: `20`

That setup lives in `netlify.toml`.

## Project Structure

```text
MorCSA/
├── README.md
├── index.html
├── netlify.toml
├── package.json
├── scripts/
│   ├── build.mjs
│   └── dev.mjs
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── components/
│   │   └── PixelSprite.tsx
│   └── data/
│       ├── cedPractice.ts
│       ├── course.ts
│       ├── journey.ts
│       ├── lessonGuides.ts
│       └── practiceDecks.ts
└── dist/
```

## Content Files

If you want to extend the course, these are the most important files:

- `src/data/journey.ts`
  Course roadmap, unit definitions, lesson layout, and CED subunit mapping.

- `src/data/cedPractice.ts`
  Source-backed CED practice banks and Unit 1 teaching-guide text.

- `src/data/course.ts`
  Core missions, mentors, exam framing, and shared challenge types.

- `src/data/practiceDecks.ts`
  Larger practice decks and lesson drill material.

- `src/data/lessonGuides.ts`
  Broader lesson coaching content used where no subunit-specific source guide exists yet.

- `src/App.tsx`
  Main app flow, route screens, lesson pathway logic, active-step rendering, and practice interactions.

## Product Direction

MorCSA is aiming to become:

- a full APCSA course, not just a quiz bank
- a better first stop for students who want to learn and not only cram
- a cleaner, more game-like path through the College Board material

The long-term target is a site where every APCSA subunit has:

- teaching that is actually readable
- source-backed practice
- code interaction
- visual progression
- enough reps to make a real score-5 route believable

## What Still Needs To Be Built

High-priority next steps:

- source-backed Units 2 to 4 at the same depth as Unit 1
- more Java IDE missions per subunit
- richer adaptive progression and review loops
- more FRQ-style build sessions
- stronger visual polish and lesson-to-lesson transitions

## Why The Repo Exists

MorCSA exists because a lot of AP study tools are either too sterile, too overwhelming, or too shallow.

This repo is the attempt to build something more memorable:

- clearer than a textbook
- more structured than random practice
- more motivating than a static cram site

If you are here to keep building it, the core idea is worth protecting:

teach the course like a path, not like a pile.
