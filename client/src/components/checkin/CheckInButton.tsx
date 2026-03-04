import { useState, useCallback } from "react";
import { MapPin, Check, Loader2, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameContext";
import LoginModal from "@/components/auth/LoginModal";
import QRScanner from "@/components/checkin/QRScanner";
import PhotoCapture from "@/components/checkin/PhotoCapture";
import { toast } from "sonner";

interface CheckInButtonProps {
  targetType: "vineyard" | "cellar" | "festival";
  targetId: string;
  targetCoordinates: { lat: number; lng: number };
  radiusMeters?: number;
  showQR?: boolean;
}

function getDistanceMeters(
  lat1: number, lng1: number, lat2: number, lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CheckInButton({
  targetType,
  targetId,
  targetCoordinates,
  radiusMeters = 200,
  showQR = true,
}: CheckInButtonProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthContext();
  const { addCheckIn, canCheckIn } = useGameContext();
  const [showLogin, setShowLogin] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);

  const allowed = canCheckIn(targetId);

  const handleGPSCheckIn = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    if (!allowed) {
      toast.error(t("detail.checkInCooldown"));
      return;
    }

    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          }),
      );

      const distance = getDistanceMeters(
        position.coords.latitude,
        position.coords.longitude,
        targetCoordinates.lat,
        targetCoordinates.lng,
      );

      if (distance > radiusMeters) {
        toast.error(t("detail.tooFar"));
        return;
      }

      setLastPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setShowCamera(true);
    } catch {
      toast.error(t("detail.locationError"));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, allowed, targetCoordinates, radiusMeters, t]);

  const handlePhotoCapture = useCallback(
    (photoUrl: string) => {
      setShowCamera(false);
      addCheckIn(
        targetType, targetId, "gps", photoUrl,
        user?.uid, lastPosition?.lat, lastPosition?.lng
      );
      setChecked(true);
      toast.success(t("detail.checkInSuccess"));
    },
    [targetType, targetId, addCheckIn, t, user, lastPosition],
  );

  const handleSkipPhoto = useCallback(() => {
    setShowCamera(false);
    addCheckIn(
      targetType, targetId, "gps", undefined,
      user?.uid, lastPosition?.lat, lastPosition?.lng
    );
    setChecked(true);
    toast.success(t("detail.checkInSuccess"));
  }, [targetType, targetId, addCheckIn, t, user, lastPosition]);

  const handleQRScan = useCallback(
    (data: string) => {
      setShowScanner(false);
      try {
        const parsed = JSON.parse(data);
        if (parsed.targetId === targetId || parsed.targetType === targetType) {
          addCheckIn(targetType, targetId, "qr", undefined, user?.uid);
          setChecked(true);
          toast.success(t("detail.checkInSuccess"));
        } else {
          toast.error(t("qr.wrongCode"));
        }
      } catch {
        if (data.includes(targetId)) {
          addCheckIn(targetType, targetId, "qr", undefined, user?.uid);
          setChecked(true);
          toast.success(t("detail.checkInSuccess"));
        } else {
          toast.error(t("qr.invalidCode"));
        }
      }
    },
    [targetType, targetId, addCheckIn, t, user],
  );

  const openQR = useCallback(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    if (!allowed) {
      toast.error(t("detail.checkInCooldown"));
      return;
    }
    setShowScanner(true);
  }, [isAuthenticated, allowed, t]);

  if (checked || !allowed) {
    return (
      <button
        disabled
        className="flex items-center gap-2 bg-secondary/10 text-secondary py-3 px-5 rounded-xl font-semibold opacity-70"
      >
        <Check size={18} />
        {t("detail.checkedIn")}
      </button>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleGPSCheckIn}
          disabled={loading}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground py-3 px-5 rounded-xl font-semibold shadow-lg shadow-secondary/20 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <MapPin size={18} />
          )}
          {t("detail.iWasHere")}
        </button>

        {showQR && (
          <button
            onClick={openQR}
            className="flex items-center gap-2 bg-card border border-border text-foreground py-3 px-4 rounded-xl font-semibold active:scale-[0.98] transition-transform"
            title={t("qr.scanQR")}
          >
            <QrCode size={18} />
          </button>
        )}
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <QRScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />
      <PhotoCapture
        open={showCamera}
        onClose={handleSkipPhoto}
        onCapture={handlePhotoCapture}
      />
    </>
  );
}
