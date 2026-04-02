# Math Practice — Product Requirements

## Vision

An interactive math tutoring web app for children with adaptive difficulty. Kids choose which operations to practice (addition, subtraction, multiplication, division), answer generated problems, and the app automatically adjusts the difficulty based on their performance. Deployed as a static site on GitHub Pages — zero infrastructure, accessible from any browser.

## Target audience

Children (ages 6-12) practicing arithmetic. Parents configure or supervise initially.

## Key features

- **Configurable operations** — child or parent selects which math operations to practice
- **Adaptive difficulty** — number ranges auto-adjust based on answer streaks (3 right → harder, 3 wrong → easier)
- **Instant feedback** — correct/incorrect shown immediately with the right answer
- **Session persistence** — progress and difficulty saved in localStorage, survives page refresh
- **GitHub Pages deployment** — publicly accessible, no server required

## Implementation Phases

| Phase | Status | Stories | Spec |
|---|---|---|---|
| foundation | Draft | US-MP1, US-MP2, US-MP3, US-MP4 | [phases/foundation.md](phases/foundation.md) |
