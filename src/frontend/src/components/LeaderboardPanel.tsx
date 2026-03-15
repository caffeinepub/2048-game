import type { LeaderboardEntry } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSetDisplayName } from "@/hooks/useQueries";
import { Check, Loader2, LogIn, Pencil, Trophy, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  isLoggedIn: boolean;
  currentUserPrincipal?: string;
  displayName: string;
  onLogin: () => void;
}

const RANK_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];

const RANK_LABELS = ["🥇", "🥈", "🥉"];

export function LeaderboardPanel({
  entries,
  isLoading,
  isLoggedIn,
  currentUserPrincipal,
  displayName,
  onLogin,
}: LeaderboardPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const { mutate: setDisplayName, isPending } = useSetDisplayName();

  const handleSave = () => {
    if (!nameInput.trim()) return;
    setDisplayName(nameInput.trim(), {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleCancel = () => {
    setNameInput(displayName);
    setIsEditing(false);
  };

  return (
    <motion.aside
      data-ocid="game.leaderboard_panel"
      className="w-full flex flex-col gap-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Leaderboard Header */}
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-foreground">
          Leaderboard
        </h2>
      </div>

      {/* Display Name Editor */}
      {isLoggedIn ? (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/40 border border-border">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Your Name
          </p>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex gap-2"
              >
                <Input
                  data-ocid="game.display_name_input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Enter display name"
                  className="h-8 text-sm bg-background border-border"
                  maxLength={30}
                  autoFocus
                />
                <Button
                  data-ocid="game.display_name_save_button"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={handleCancel}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-medium text-foreground flex-1 truncate">
                  {displayName || "Anonymous"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setNameInput(displayName);
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-secondary/40 border border-border">
          <p className="text-xs text-muted-foreground mb-2">
            Sign in to save your scores and appear on the leaderboard.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 text-xs"
            onClick={onLogin}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Button>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] text-xs font-mono text-muted-foreground uppercase tracking-wider px-4 py-2 border-b border-border bg-secondary/20">
          <span className="w-8">#</span>
          <span>Player</span>
          <span>Score</span>
        </div>

        {isLoading ? (
          <div className="p-4 flex flex-col gap-2">
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
              <Skeleton key={k} className="h-8 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div
            data-ocid="game.leaderboard_empty_state"
            className="py-8 text-center text-muted-foreground text-sm"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No scores yet. Be the first!</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul>
              {entries.slice(0, 10).map((entry, i) => {
                const isCurrentUser =
                  currentUserPrincipal &&
                  entry.user.toString() === currentUserPrincipal;
                const rankLabel = i < 3 ? RANK_LABELS[i] : `${i + 1}`;
                const rankColor =
                  i < 3 ? RANK_COLORS[i] : "text-muted-foreground";
                const itemNum = i + 1;

                return (
                  <motion.li
                    key={entry.user.toString()}
                    data-ocid={`game.leaderboard_item.${itemNum}`}
                    className={`
                      grid grid-cols-[auto_1fr_auto] items-center
                      px-4 py-2.5 text-sm gap-2
                      border-b border-border/50 last:border-0
                      ${isCurrentUser ? "bg-primary/10" : "hover:bg-secondary/30"}
                      transition-colors
                    `}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <span className={`w-8 font-mono text-base ${rankColor}`}>
                      {rankLabel}
                    </span>
                    <span
                      className={`truncate ${isCurrentUser ? "font-semibold text-primary" : "text-foreground"}`}
                    >
                      {entry.displayName || "Anonymous"}
                    </span>
                    <span className="font-mono font-bold text-right">
                      {Number(entry.score).toLocaleString()}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </div>
    </motion.aside>
  );
}
