import { motion } from "motion/react";

interface ScorePanelProps {
  score: number;
  personalBest: number | null;
}

function ScoreBox({
  label,
  value,
  highlight,
}: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-5 py-3 rounded-xl border min-w-[100px]"
      style={{
        background: highlight
          ? "oklch(0.2 0.04 60 / 0.8)"
          : "oklch(0.2 0.025 265 / 0.9)",
        borderColor: highlight
          ? "oklch(0.78 0.18 60 / 0.35)"
          : "oklch(0.28 0.03 265)",
        boxShadow: highlight
          ? "inset 0 1px 0 oklch(1 0 0 / 0.08), 0 0 12px oklch(0.78 0.18 60 / 0.15), 0 4px 12px oklch(0 0 0 / 0.3)"
          : "inset 0 1px 0 oklch(1 0 0 / 0.05), 0 4px 12px oklch(0 0 0 / 0.3)",
      }}
    >
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em] mb-1">
        {label}
      </span>
      <span
        className="text-2xl font-display font-black leading-none"
        style={{
          color: highlight ? "oklch(0.85 0.2 65)" : "oklch(0.95 0.01 90)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ScorePanel({ score, personalBest }: ScorePanelProps) {
  return (
    <motion.div
      data-ocid="game.score_panel"
      className="flex gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <ScoreBox label="Score" value={score.toLocaleString()} highlight />
      <ScoreBox
        label="Best"
        value={personalBest !== null ? personalBest.toLocaleString() : "—"}
      />
    </motion.div>
  );
}
