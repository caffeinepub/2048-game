import type { CellGrid, Game2048Actions } from "@/hooks/useGame2048";
import { useCallback, useEffect, useRef } from "react";
import { GameTile } from "./GameTile";

interface GameBoardProps {
  cells: CellGrid;
  actions: Game2048Actions;
  gameOver: boolean;
}

const SWIPE_THRESHOLD = 40;
const BOARD_SIZE = 4;
const CELL_POSITIONS = Array.from({ length: BOARD_SIZE }, (_, r) =>
  Array.from({ length: BOARD_SIZE }, (_, c) => ({
    r,
    c,
    posKey: `cell-r${r}-c${c}`,
  })),
).flat();

export function GameBoard({ cells, actions, gameOver }: GameBoardProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          actions.moveLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          actions.moveRight();
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          actions.moveUp();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          actions.moveDown();
          break;
      }
    },
    [actions, gameOver],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || gameOver) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD)
        return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) actions.moveRight();
        else actions.moveLeft();
      } else {
        if (dy > 0) actions.moveDown();
        else actions.moveUp();
      }
    },
    [actions, gameOver],
  );

  return (
    <div
      data-ocid="game.canvas_target"
      className="game-board"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }}
    >
      <div
        className="grid gap-[12px]"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          width: "min(92vw, 448px)",
          height: "min(92vw, 448px)",
        }}
      >
        {CELL_POSITIONS.map(({ r, c, posKey }) => (
          <div
            key={posKey}
            className="board-cell relative"
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <GameTile tile={cells[r][c]} />
          </div>
        ))}
      </div>
    </div>
  );
}
