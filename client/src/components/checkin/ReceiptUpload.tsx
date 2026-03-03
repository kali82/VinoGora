import { useState, useCallback, useRef } from "react";
import { Receipt, Camera, Upload, Check, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameContext";
import LoginModal from "@/components/auth/LoginModal";
import { toast } from "sonner";

export default function ReceiptUpload() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthContext();
  const { addPoints } = useGameContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    if (!preview) return;

    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    addPoints(100);
    setDone(true);
    setUploading(false);
    toast.success(t("receipt.uploadSuccess"));
  }, [isAuthenticated, preview, addPoints, t]);

  const handleReset = useCallback(() => {
    setPreview(null);
    setDone(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const openPicker = useCallback(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    fileInputRef.current?.click();
  }, [isAuthenticated]);

  if (done) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <Check size={28} className="text-green-600" />
        </div>
        <p className="font-display font-bold">{t("receipt.thankYou")}</p>
        <p className="text-sm text-muted-foreground">{t("receipt.pointsAdded")}</p>
        <button
          onClick={handleReset}
          className="text-sm text-primary font-semibold"
        >
          {t("receipt.uploadAnother")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">
              {t("receipt.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("receipt.description")}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview ? (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={preview}
              alt="Receipt"
              className="w-full h-40 object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={openPicker}
            className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Camera size={28} />
            <span className="text-sm font-medium">{t("receipt.takePhoto")}</span>
          </button>
        )}

        {preview && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? t("common.loading") : t("receipt.upload")}
          </button>
        )}
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
