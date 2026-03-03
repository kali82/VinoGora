import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] bg-amber-500 text-amber-950 text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <WifiOff size={14} />
      {t("pwa.offline")}
    </div>
  );
}
