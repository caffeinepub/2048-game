import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface WinDialogProps {
  isOpen: boolean;
  onKeepGoing: () => void;
  onNewGame: () => void;
  score: number;
}

export function WinDialog({
  isOpen,
  onKeepGoing,
  onNewGame,
  score,
}: WinDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="game.win_dialog"
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: "oklch(0.13 0.02 270 / 0.88)",
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
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Sparkles className="w-16 h-16 text-primary" />
            </motion.div>
            <div>
              <h2 className="font-display text-5xl font-black text-primary leading-none mb-2">
                You Win!
              </h2>
              <p className="text-muted-foreground text-sm font-mono">
                Score:{" "}
                <span className="text-foreground font-bold">
                  {score.toLocaleString()}
                </span>
              </p>
            </div>
            <p className="text-muted-foreground text-sm max-w-[200px]">
              You reached <span className="text-primary font-bold">2048!</span>{" "}
              Keep going for a higher score?
            </p>
            <div className="flex gap-3 w-full">
              <Button
                data-ocid="game.continue_button"
                className="flex-1 font-display font-bold"
                onClick={onKeepGoing}
              >
                Keep Going
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-display"
                onClick={onNewGame}
              >
                New Game
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
