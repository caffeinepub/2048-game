import { Button } from "@/components/ui/button";
import { Frown, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface GameOverDialogProps {
  isOpen: boolean;
  onRetry: () => void;
  score: number;
  isSubmitting: boolean;
  submitted: boolean;
}

export function GameOverDialog({
  isOpen,
  onRetry,
  score,
  isSubmitting,
  submitted,
}: GameOverDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="game.gameover_dialog"
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: "oklch(0.08 0.02 270 / 0.9)",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            className="text-center flex flex-col items-center gap-5 px-6"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <Frown className="w-14 h-14 text-destructive" />
            </motion.div>
            <div>
              <h2 className="font-display text-5xl font-black text-foreground leading-none mb-2">
                Game Over
              </h2>
              <p className="text-muted-foreground text-sm font-mono">
                Final Score:{" "}
                <span className="text-foreground font-bold">
                  {score.toLocaleString()}
                </span>
              </p>
            </div>

            {isSubmitting && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving score…</span>
              </div>
            )}
            {submitted && !isSubmitting && (
              <p className="text-xs text-primary">
                Score saved to leaderboard!
              </p>
            )}

            <Button
              data-ocid="game.retry_button"
              className="w-full font-display font-bold"
              onClick={onRetry}
              disabled={isSubmitting}
            >
              Try Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
