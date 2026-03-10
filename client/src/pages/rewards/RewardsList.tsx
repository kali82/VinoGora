import { Link } from "wouter";
import {
  ArrowLeft,
  Gift,
  Wine,
  Ticket,
  ShoppingBag,
  Sparkles,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { rewards } from "@shared/data/rewards";
import { useGameContext } from "@/contexts/GameContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ElementType> = {
  tasting: Wine,
  wine: ShoppingBag,
  experience: Sparkles,
  merchandise: Gift,
};

export default function RewardsList() {
  const { t: tr } = useTranslation();
  const { t } = useLocalized();
  const { state, addPoints } = useGameContext();
  const { user, isAuthenticated } = useAuthContext();

  const handleClaim = async (reward: typeof rewards[0]) => {
    if (!isAuthenticated || !user) {
      toast.error(tr("common.loginRequired"));
      return;
    }
    if (state.points < reward.pointsCost) {
      toast.error(tr("rewards.notEnoughPoints"));
      return;
    }
    try {
      await apiRequest("POST", "/api/rewards/claim", {
        userId: user.uid,
        rewardId: reward.id,
      });
      addPoints(-reward.pointsCost);
      toast.success(tr("rewards.claimed"));
    } catch {
      toast.error(tr("common.error"));
    }
  };

  return (
    <div className="min-h-full bg-background pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-accent/20 to-background px-5 pt-8 pb-8 pt-safe-top">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/profile">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-foreground shadow-sm border border-border">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">{tr("rewards.title")}</h1>
            <p className="text-sm text-muted-foreground">{tr("rewards.subtitle")}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{tr("rewards.yourPoints")}</p>
            <p className="text-2xl font-display font-bold text-primary">{state.points} pkt</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4 -mt-2">
        {rewards.map((reward) => {
          const canAfford = state.points >= reward.pointsCost;
          const Icon = categoryIcons[reward.category] || Gift;

          return (
            <div
              key={reward.id}
              className={`bg-card rounded-2xl border border-border p-5 shadow-sm ${!canAfford ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  canAfford ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-bold leading-tight">
                    {t(reward.title)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(reward.description)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5">
                  <Ticket size={14} className="text-primary" />
                  <span className="text-sm font-bold text-primary">{reward.pointsCost} pkt</span>
                </div>

                <button
                  onClick={() => handleClaim(reward)}
                  disabled={!canAfford}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                    canAfford
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {canAfford ? (
                    <span className="flex items-center gap-1.5">
                      <Gift size={14} />
                      {tr("rewards.claim")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Lock size={14} />
                      {tr("rewards.locked")}
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
