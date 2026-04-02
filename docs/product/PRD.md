# Math Practice — Product Requirements

## Vision

An interactive math tutoring tool for children, gamified through an adventure map experience. Children progress along four operation paths (addition, subtraction, multiplication, division), completing challenges that get progressively harder. Convergence points where paths cross test combined skills. Star-based scoring rewards accuracy and speed. Deployed as a static site on GitHub Pages — zero infrastructure, accessible from any browser.

## Target audience

Children (ages 6–12) learning basic arithmetic.

## Key features

- **Adventure map** — four winding paths (one per operation) with challenge nodes to explore
- **Star scoring** — earn 1–3 stars per challenge based on accuracy and speed
- **Progressive difficulty** — each challenge is harder than the last, gated by completion
- **Convergence challenges** — where paths cross, challenges test mixed operation types
- **Instant feedback** — correct/incorrect shown immediately with the right answer
- **Progress persistence** — map progress and star ratings saved in localStorage

## Implementation Phases

| Phase | Status | Stories | Spec |
|---|---|---|---|
| foundation | Shipped | US-MP1, US-MP2, US-MP3, US-MP4 | [phases/foundation.md](phases/foundation.md) |
| adventure-map | Shipped | US-01, US-02, US-03, US-04 | [phases/adventure-map.md](phases/adventure-map.md) |
| number-sense | Shipped | US-05, US-06, US-07, US-08 | [phases/number-sense.md](phases/number-sense.md) |
| user-profiles | Draft | US-09, US-10, US-11 | [phases/user-profiles.md](phases/user-profiles.md) |
