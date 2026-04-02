# Math Practice

An interactive math tutoring app for children with adaptive difficulty. Built with React + TypeScript, deployed on GitHub Pages.

## How to play

### Choosing operations

1. On the start screen, you'll see checkboxes for four math operations: Addition (+), Subtraction (-), Multiplication (x), and Division (/).
2. Check or uncheck the operations you want to practice. All four are selected by default.
3. Press **Start** to begin your session.

### Answering problems

1. A math problem is displayed (e.g., "7 + 3 = ?").
2. Type your answer in the number input field.
3. Press **Enter** or click **Submit**.
4. You'll see immediate feedback:
   - **Correct!** (in green) if your answer is right.
   - **Incorrect. The answer is X.** (in red) if your answer is wrong.
5. Click **Next** to move to the next problem.
6. Your running score is shown at the top (e.g., "5 / 8 correct").

### Adaptive difficulty

The app automatically adjusts difficulty based on your performance:

- **3 correct answers in a row** increases the number range (harder problems).
- **3 incorrect answers in a row** decreases the number range (easier problems).
- The difficulty level is shown at the top of the quiz screen (e.g., "Level 2 (up to 20)").
- The range starts at 1-10 and can go up to 1-100.
- Your difficulty level and score are saved in the browser, so refreshing the page mid-session keeps your progress.

### Ending a session

Click **End Session** at the top right to return to the start screen. This resets your score and difficulty for the next session.

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm test          # Run tests
npm run lint      # Lint check
```
