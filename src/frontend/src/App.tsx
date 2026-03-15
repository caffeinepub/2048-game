import { GameBoard } from "@/components/GameBoard";
import { GameOverDialog } from "@/components/GameOverDialog";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { ScorePanel } from "@/components/ScorePanel";
import { WinDialog } from "@/components/WinDialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useGame2048 } from "@/hooks/useGame2048";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useLeaderboard,
  usePersonalBest,
  useSubmitScore,
  useUserProfile,
} from "@/hooks/useQueries";
import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function App() {
  const { identity, login, clear } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const currentUserPrincipal = identity?.getPrincipal().toString();

  const game = useGame2048();
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } =
    useLeaderboard();
  const { data: personalBestBigInt } = usePersonalBest();
  const { data: userProfile } = useUserProfile();
  const { mutate: submitScore, isPending: isSubmitting } = useSubmitScore();

  const personalBest =
    personalBestBigInt !== null && personalBestBigInt !== undefined
      ? Number(personalBestBigInt)
      : null;

  const displayedBest =
    personalBest !== null
      ? Math.max(personalBest, game.score)
      : game.score > 0
        ? game.score
        : null;

  // Track if score has been submitted for current game
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const prevStatusRef = useRef(game.status);

  // Auto-submit on win or game over
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const currStatus = game.status;
    prevStatusRef.current = currStatus;

    if (
      prevStatus === "playing" &&
      (currStatus === "won" || currStatus === "gameover")
    ) {
      if (isLoggedIn && game.score > 0 && !scoreSubmitted) {
        setScoreSubmitted(true);
        submitScore(BigInt(game.score), {
          onSuccess: () => {
            toast.success("Score saved to leaderboard!");
          },
          onError: () => {
            toast.error("Failed to save score.");
          },
        });
      }
    }
  }, [game.status, game.score, isLoggedIn, scoreSubmitted, submitScore]);

  const handleNewGame = () => {
    game.newGame();
    setScoreSubmitted(false);
  };

  const handleContinue = () => {
    game.continueAfterWin();
  };

  const displayName = userProfile?.name ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background atmospheric gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 55% at 50% -5%, oklch(0.28 0.07 270 / 0.5) 0%, transparent 65%),
            radial-gradient(ellipse 65% 45% at 85% 110%, oklch(0.22 0.08 52 / 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 10% 80%, oklch(0.18 0.05 300 / 0.25) 0%, transparent 55%)
          `,
        }}
      />
      {/* Subtle noise overlay for texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 w-full px-4 py-4 sm:py-5 flex items-center justify-between max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-5xl sm:text-6xl font-black tracking-tight leading-none">
            <span
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.24 68), oklch(0.72 0.3 42))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 2px 8px oklch(0.78 0.22 55 / 0.3))",
              }}
            >
              2048
            </span>
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Join tiles · reach{" "}
            <span className="text-primary font-semibold">2048!</span>
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* Auth Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
                onClick={clear}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-mono border-border"
                onClick={login}
              >
                Sign In
              </Button>
            )}
          </motion.div>

          {/* New Game Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Button
              data-ocid="game.new_game_button"
              size="sm"
              className="gap-2 font-display font-bold"
              onClick={handleNewGame}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Game
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
          {/* Game Column */}
          <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
            {/* Score Panel */}
            <ScorePanel score={game.score} personalBest={displayedBest} />

            {/* Controls hint */}
            <motion.p
              className="text-xs font-mono text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ↑↓←→ · WASD · Swipe
            </motion.p>

            {/* Game Board with Overlays */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <GameBoard
                cells={game.cells}
                actions={{
                  moveLeft: game.moveLeft,
                  moveRight: game.moveRight,
                  moveUp: game.moveUp,
                  moveDown: game.moveDown,
                  newGame: game.newGame,
                  continueAfterWin: game.continueAfterWin,
                }}
                gameOver={game.status === "gameover"}
              />

              {/* Win Overlay */}
              <WinDialog
                isOpen={game.status === "won"}
                onKeepGoing={handleContinue}
                onNewGame={handleNewGame}
                score={game.score}
              />

              {/* Game Over Overlay */}
              <GameOverDialog
                isOpen={game.status === "gameover"}
                onRetry={handleNewGame}
                score={game.score}
                isSubmitting={isSubmitting}
                submitted={scoreSubmitted}
              />
            </motion.div>
          </div>

          {/* Leaderboard Column */}
          <div className="w-full lg:w-72 xl:w-80">
            <LeaderboardPanel
              entries={leaderboard}
              isLoading={isLoadingLeaderboard}
              isLoggedIn={isLoggedIn}
              currentUserPrincipal={currentUserPrincipal}
              displayName={displayName}
              onLogin={login}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center">
        <p className="text-xs font-mono text-muted-foreground/50">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary/70">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary/90 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster />
    </div>
  );
}
