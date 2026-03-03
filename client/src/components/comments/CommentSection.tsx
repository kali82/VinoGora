import { useState } from "react";
import { Star, Send, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameContext";
import LoginModal from "@/components/auth/LoginModal";
import { toast } from "sonner";

interface CommentSectionProps {
  targetType: "vineyard" | "cellar" | "wine";
  targetId: string;
}

function TouchStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="p-1.5 -m-1 rounded-lg active:bg-accent/20 transition-colors touch-manipulation"
          type="button"
        >
          <Star
            size={26}
            className={`transition-colors ${
              star <= value
                ? "text-accent fill-accent"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function CommentSection({
  targetType,
  targetId,
}: CommentSectionProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();
  const { getComments, addComment } = useGameContext();
  const [showLogin, setShowLogin] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);

  const comments = getComments(targetType, targetId);
  const hasCommented = comments.some((c) => c.userId === user?.uid);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    if (!text.trim() || rating === 0) return;

    addComment({
      userId: user!.uid,
      targetType,
      targetId,
      rating,
      text: text.trim(),
    });
    setText("");
    setRating(0);
    toast.success(t("detail.commentAdded"));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-bold flex items-center gap-2">
        <MessageCircle size={20} />
        {t("detail.comments")} ({comments.length})
      </h3>

      {!hasCommented && (
        <div className="bg-card p-4 rounded-2xl border border-border space-y-3">
          <TouchStarRating value={rating} onChange={setRating} />
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("detail.writeComment")}
              className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || rating === 0}
              className="w-11 h-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0 min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("detail.noComments")}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card p-4 rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {comment.userId.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={
                          star <= comment.rating
                            ? "text-accent fill-accent"
                            : "text-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
