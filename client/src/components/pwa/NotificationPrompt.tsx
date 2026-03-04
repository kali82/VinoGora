import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const DISMISS_KEY = "vinogora_push_dismissed";

export default function NotificationPrompt() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();
  const { supported, permission, subscribed, requestPermission } =
    usePushNotifications(user?.uid);

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (
    !supported ||
    !isAuthenticated ||
    permission === "denied" ||
    subscribed ||
    permission === "granted" ||
    dismissed
  ) {
    return null;
  }

  const handleEnable = async () => {
    await requestPermission();
    setDismissed(true);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="mx-5 mt-4 bg-card rounded-2xl border border-border p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Bell size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-sm">{t("push.title")}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("push.description")}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleEnable}
            className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg"
          >
            {t("push.enable")}
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground font-medium px-3 py-2"
          >
            {t("pwa.dismiss")}
          </button>
        </div>
      </div>
      <button onClick={handleDismiss} className="shrink-0 mt-0.5">
        <X size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}
