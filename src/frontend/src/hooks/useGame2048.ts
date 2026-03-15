import { useCallback, useState } from "react";

export type Board = number[][];
export type GameStatus = "playing" | "won" | "gameover";
export type TileAnimState = "new" | "merged" | "idle";

export interface TileInfo {
  value: number;
  animState: TileAnimState;
}

const BOARD_SIZE = 4;
const WIN_VALUE = 2048;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function getEmptyCells(board: Board): [number, number][] {
  const empty: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  return empty;
}

function addRandomTile(board: Board): Board {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const idx = Math.floor(Math.random() * empty.length);
  const [r, c] = empty[idx];
  const newBoard = board.map((row) => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slideLeft(row: number[]): {
  row: number[];
  score: number;
  merged: boolean[];
} {
  const filtered = row.filter((v) => v !== 0);
  const result: number[] = [];
  const mergedFlags: boolean[] = [];
  let score = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      result.push(val);
      mergedFlags.push(true);
      score += val;
      i += 2;
    } else {
      result.push(filtered[i]);
      mergedFlags.push(false);
      i++;
    }
  }
  while (result.length < BOARD_SIZE) {
    result.push(0);
    mergedFlags.push(false);
  }
  return { row: result, score, merged: mergedFlags };
}

export interface MoveResult {
  board: Board;
  score: number;
  moved: boolean;
  mergedCells: boolean[][];
}

function moveLeft(board: Board): MoveResult {
  let totalScore = 0;
  let moved = false;
  const newBoard: Board = [];
  const mergedCells: boolean[][] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const { row, score, merged } = slideLeft(board[r]);
    newBoard.push(row);
    mergedCells.push(merged);
    totalScore += score;
    if (row.some((v, i) => v !== board[r][i])) moved = true;
  }

  return { board: newBoard, score: totalScore, moved, mergedCells };
}

function rotateClockwise<T>(board: T[][]): T[][] {
  const n = BOARD_SIZE;
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => board[n - 1 - c][r]),
  );
}

function rotateCounterClockwise<T>(board: T[][]): T[][] {
  const n = BOARD_SIZE;
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => board[c][n - 1 - r]),
  );
}

function rotate180<T>(board: T[][]): T[][] {
  return rotateClockwise(rotateClockwise(board));
}

function moveRight(board: Board): MoveResult {
  const rotated = rotate180(board);
  const result = moveLeft(rotated);
  return {
    ...result,
    board: rotate180(result.board),
    mergedCells: rotate180(result.mergedCells),
  };
}

function moveUp(board: Board): MoveResult {
  const rotated = rotateClockwise(board);
  const result = moveLeft(rotated);
  return {
    ...result,
    board: rotateCounterClockwise(result.board),
    mergedCells: rotateCounterClockwise(result.mergedCells),
  };
}

function moveDown(board: Board): MoveResult {
  const rotated = rotateCounterClockwise(board);
  const result = moveLeft(rotated);
  return {
    ...result,
    board: rotateClockwise(result.board),
    mergedCells: rotateClockwise(result.mergedCells),
  };
}

function hasValidMoves(board: Board): boolean {
  // Check for empty cells
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return true;
    }
  }
  // Check for adjacent same values
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = board[r][c];
      if (r < BOARD_SIZE - 1 && board[r + 1][c] === val) return true;
      if (c < BOARD_SIZE - 1 && board[r][c + 1] === val) return true;
    }
  }
  return false;
}

function hasWon(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] >= WIN_VALUE) return true;
    }
  }
  return false;
}

// Each cell tracks its value + animation state
export type CellGrid = TileInfo[][];

function boardToCellGrid(
  board: Board,
  mergedCells?: boolean[][],
  newCells?: Set<string>,
): CellGrid {
  return board.map((row, r) =>
    row.map((value, c) => {
      let animState: TileAnimState = "idle";
      if (mergedCells?.[r][c] && value !== 0) animState = "merged";
      if (newCells?.has(`${r},${c}`) && value !== 0) animState = "new";
      return { value, animState };
    }),
  );
}

function initBoard(): { cells: CellGrid; board: Board } {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  const cells = boardToCellGrid(board);
  return { cells, board };
}

export interface Game2048State {
  cells: CellGrid;
  score: number;
  status: GameStatus;
  hasAchievedWin: boolean;
}

export interface Game2048Actions {
  moveLeft: () => void;
  moveRight: () => void;
  moveUp: () => void;
  moveDown: () => void;
  newGame: () => void;
  continueAfterWin: () => void;
}

export function useGame2048(): Game2048State & Game2048Actions {
  const [_board, setBoard] = useState<Board>(() => {
    const { board: b } = initBoard();
    return b;
  });
  const [cells, setCells] = useState<CellGrid>(() => {
    const { cells: c } = initBoard();
    return c;
  });
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [hasAchievedWin, setHasAchievedWin] = useState(false);

  const applyMove = useCallback(
    (moveFn: (b: Board) => MoveResult) => {
      setBoard((currentBoard) => {
        if (status === "gameover") return currentBoard;

        const result = moveFn(currentBoard);
        if (!result.moved) return currentBoard;

        const newBoard = addRandomTile(result.board);

        // Detect new tile position
        const newCells = new Set<string>();
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (
              newBoard[r][c] !== result.board[r][c] &&
              result.board[r][c] === 0
            ) {
              newCells.add(`${r},${c}`);
            }
          }
        }

        const newCellGrid = boardToCellGrid(
          newBoard,
          result.mergedCells,
          newCells,
        );
        setCells(newCellGrid);

        setScore((prev) => prev + result.score);

        // Check win
        if (!hasAchievedWin && hasWon(newBoard)) {
          setHasAchievedWin(true);
          setStatus("won");
        } else if (!hasValidMoves(newBoard)) {
          setStatus("gameover");
        }

        return newBoard;
      });
    },
    [status, hasAchievedWin],
  );

  const handleMoveLeft = useCallback(() => applyMove(moveLeft), [applyMove]);
  const handleMoveRight = useCallback(() => applyMove(moveRight), [applyMove]);
  const handleMoveUp = useCallback(() => applyMove(moveUp), [applyMove]);
  const handleMoveDown = useCallback(() => applyMove(moveDown), [applyMove]);

  const newGame = useCallback(() => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setCells(boardToCellGrid(b));
    setScore(0);
    setStatus("playing");
    setHasAchievedWin(false);
  }, []);

  const continueAfterWin = useCallback(() => {
    setStatus("playing");
  }, []);

  return {
    cells,
    score,
    status,
    hasAchievedWin,
    moveLeft: handleMoveLeft,
    moveRight: handleMoveRight,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    newGame,
    continueAfterWin,
  };
}
