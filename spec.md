# 2048 Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- 2048 puzzle game with a 4x4 grid
- Tile sliding mechanics (up, down, left, right) via keyboard arrow keys and WASD
- Swipe gesture support for mobile
- Tile merging logic: same-value tiles merge when they collide, doubling their value
- Score tracking: score increases by the value of each merged tile
- Best score tracking persisted in backend canister
- Win condition: reaching the 2048 tile (with option to continue)
- Game over detection: no valid moves remaining
- New Game button to reset the board
- Animated tile transitions and new tile appearance
- Leaderboard: top scores stored in backend, viewable in-game

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Store and retrieve best score per anonymous/authenticated user
   - Store global top scores leaderboard (top 10)
   - Functions: submitScore(score: Nat), getBestScore(), getLeaderboard()

2. Frontend (React + Canvas/DOM):
   - 4x4 game board rendered with DOM elements (divs) for smooth CSS transitions
   - Game logic hook: useGame2048 managing board state, score, moves
   - Keyboard event listeners for arrow keys + WASD
   - Touch/swipe event listeners for mobile
   - Tile color mapping by value (2=beige, 4=tan, 8=orange, ..., 2048=gold)
   - Score display (current + best)
   - Win modal and Game Over modal
   - Leaderboard panel showing top 10 scores
   - Submit score to backend on game over or win
