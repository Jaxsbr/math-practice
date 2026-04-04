# Math Practice

[Play it here](https://jaxsbr.github.io/math-practice/)

An interactive math adventure for children (ages 6-12). Explore six winding paths on an adventure map, each with progressively harder challenges. Earn stars for accuracy and speed, unlock milestones that test combined skills.

## Adventure map

The app opens to an adventure map with six operation paths:

| Path | Operation | Challenges |
|---|---|---|
| Addition | + | Pebble Path → Summit Plus |
| Subtraction | − | Leaf Fall → Minus Mountain |
| Multiplication | × | Mushroom Ring → Times Tower |
| Division | ÷ | Berry Split → Divide Peak |
| Rounding | ≈ | Rounding Rock → Summit Round |
| Number Challenge | # | Digit Den → Master Mountain |

Each path has 5 challenge nodes with increasing difficulty. The first node on every path is unlocked from the start.

### Star scoring

- **3 stars** — 90%+ accuracy within the time target
- **2 stars** — 70%+ accuracy
- **1 star** — completed the challenge

Earning at least 1 star unlocks the next node on the path. Replay any challenge to improve your rating.

### Milestone convergence

Two milestone challenges span all paths:

- **Milestone 1** (between tier 2 and 3) — unlocks when you complete any 4 of 6 tier-2 nodes. Passing unlocks all tier-3 nodes (for paths you've completed).
- **Milestone 2** (after tier 5) — unlocks when you complete any 4 of 6 tier-5 nodes. Marks the map as fully complete.

Milestone challenges draw problems only from operations you've already practised.

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm test          # Run tests
npm run lint      # Lint check
```

Deployed to GitHub Pages on push to `main`.

<!-- build-loop -->
---
*Built with [build-loop](docs/plan/) — init v9 | builds v9, v11, v12*
