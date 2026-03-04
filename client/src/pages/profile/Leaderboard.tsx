import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Crown, Medal, Star } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoUrl?: string;
  points: number;
  level: number;
}

const podiumIcons = [Crown, Trophy, Medal];

export default function Leaderboard() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=50", { cache: "no-store" })
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <div className="p-5 pt-safe-top">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Trophy size={28} className="text-accent" />
            {t("leaderboard.title")}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t("leaderboard.empty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.uid === user?.uid;
              const PodiumIcon = rank <= 3 ? podiumIcons[index] : undefined;

              return (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                    isCurrentUser
                      ? "bg-primary/5 border-primary/20"
                      : rank <= 3
                        ? "bg-accent/5 border-accent/20"
                        : "bg-card border-border"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      rank === 1
                        ? "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400"
                        : rank === 2
                          ? "bg-gray-300/20 text-gray-600 dark:text-gray-400"
                          : rank === 3
                            ? "bg-orange-300/20 text-orange-600 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {PodiumIcon ? <PodiumIcon size={18} /> : rank}
                  </div>

                  {entry.photoUrl ? (
                    <img
                      src={entry.photoUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {entry.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {entry.displayName}
                      {isCurrentUser && (
                        <span className="text-primary ml-1">({t("leaderboard.you")})</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star size={10} className="fill-current" />
                      {t("profile.level", { level: entry.level })}
                    </div>
                  </div>

                  <span className="text-sm font-bold text-primary shrink-0">
                    {entry.points} {t("leaderboard.pts")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
