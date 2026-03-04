import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Send, MessageCircle, Camera, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameContext";
import LoginModal from "@/components/auth/LoginModal";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";
import type { UserComment } from "@shared/types";

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
  const { getComments, addComment, fetchComments } = useGameContext();
  const [showLogin, setShowLogin] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [serverComments, setServerComments] = useState<UserComment[] | null>(null);

  useEffect(() => {
    fetchComments(targetType, targetId).then(setServerComments).catch(() => {});
  }, [targetType, targetId, fetchComments]);

  const localComments = getComments(targetType, targetId);
  const comments = serverComments ?? localComments;

  const hasCommented = comments.some((c) => c.userId === user?.uid);

  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    if (!text.trim() || rating === 0) return;

    setSubmitting(true);
    let photoUrl: string | undefined;
    if (photoPreview) {
      try {
        photoUrl = await uploadPhoto(photoPreview, "comments");
      } catch {
        photoUrl = photoPreview;
      }
    }

    const newComment: Omit<UserComment, "id" | "createdAt"> = {
      userId: user!.uid,
      userName: user!.displayName || undefined,
      userAvatar: user!.photoURL || undefined,
      targetType,
      targetId,
      rating,
      text: text.trim(),
      photoUrl,
    };

    addComment(newComment);

    setServerComments((prev) =>
      prev
        ? [
            ...prev,
            {
              ...newComment,
              id: `comment-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ]
        : null
    );

    setText("");
    setRating(0);
    setPhotoPreview(null);
    setSubmitting(false);
    toast.success(t("detail.commentAdded"));
  };

  const getInitials = (comment: UserComment) => {
    if (comment.userName) {
      return comment.userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return comment.userId.slice(0, 2).toUpperCase();
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

          {photoPreview && (
            <div className="relative w-full h-32 rounded-xl overflow-hidden">
              <img
                src={photoPreview}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => { setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("detail.writeComment")}
              className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
              onKeyDown={(e) => e.key === "Enter" && !submitting && handleSubmit()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-11 h-11 bg-muted/50 border border-border text-muted-foreground rounded-xl flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] hover:text-primary transition-colors"
              type="button"
            >
              <Camera size={16} />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || rating === 0 || submitting}
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
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {getInitials(comment)}
                    </div>
                  )}
                  <div>
                    {comment.userName && (
                      <p className="text-xs font-semibold leading-tight">
                        {comment.userName}
                      </p>
                    )}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={11}
                          className={
                            star <= comment.rating
                              ? "text-accent fill-accent"
                              : "text-muted-foreground/30"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{comment.text}</p>
              {comment.photoUrl && (
                <img
                  src={comment.photoUrl}
                  alt=""
                  className="w-full h-40 object-cover rounded-xl mt-3"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
