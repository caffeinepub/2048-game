import type { TileInfo } from "@/hooks/useGame2048";
import { useEffect, useState } from "react";

interface GameTileProps {
  tile: TileInfo;
}

function getTileClass(value: number): string {
  if (value === 0) return "";
  if (value > 2048) return "tile-super";
  return `tile-${value}`;
}

function getFontSize(value: number): string {
  if (value >= 1024)
    return "text-[clamp(1rem,3.5vw,1.375rem)] font-black tracking-tight";
  if (value >= 128)
    return "text-[clamp(1.25rem,4vw,1.75rem)] font-black tracking-tight";
  if (value >= 16)
    return "text-[clamp(1.5rem,5vw,2rem)] font-extrabold tracking-tight";
  return "text-[clamp(1.75rem,6vw,2.5rem)] font-extrabold";
}

export function GameTile({ tile }: GameTileProps) {
  const [animClass, setAnimClass] = useState("");

  useEffect(() => {
    if (tile.animState === "new") {
      setAnimClass("tile-new");
    } else if (tile.animState === "merged") {
      setAnimClass("tile-merged");
    } else {
      setAnimClass("");
    }
  }, [tile.animState]);

  if (tile.value === 0) {
    return (
      <div
        className="board-cell w-full h-full"
        style={{ borderRadius: "10px" }}
      />
    );
  }

  return (
    <div
      className={`
        w-full h-full
        flex items-center justify-center
        font-display select-none
        ${getTileClass(tile.value)}
        ${getFontSize(tile.value)}
        ${animClass}
      `}
      style={{ borderRadius: "10px" }}
    >
      {tile.value}
    </div>
  );
}
