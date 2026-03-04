import { useRef, useState, useCallback } from "react";
import { Camera, X, Check, RotateCcw, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { uploadPhoto } from "@/lib/uploadPhoto";

interface PhotoCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export default function PhotoCapture({ open, onClose, onCapture }: PhotoCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      // fallback to file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const [uploading, setUploading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(preview, "checkins");
      onCapture(url);
    } catch {
      onCapture(preview);
    }
    setPreview(null);
    setUploading(false);
  }, [preview, onCapture]);

  const handleRetake = useCallback(() => {
    setPreview(null);
    startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setPreview(null);
    onClose();
  }, [stopCamera, onClose]);

  if (!open) return null;

  if (!active && !preview) {
    startCamera();
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleClose}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      <div className="bg-black/80 px-6 py-6 flex items-center justify-center gap-6 pb-safe">
        {preview ? (
          <>
            <button
              onClick={handleRetake}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <RotateCcw size={24} />
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploading}
              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={28} className="animate-spin" /> : <Check size={28} />}
            </button>
          </>
        ) : (
          <button
            onClick={takePhoto}
            className="w-16 h-16 rounded-full bg-white border-4 border-white/30 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Camera size={28} className="text-black" />
          </button>
        )}
      </div>

      {!preview && (
        <p className="text-center text-white/60 text-xs pb-4">
          {t("detail.takePhoto")}
        </p>
      )}
    </div>
  );
}
