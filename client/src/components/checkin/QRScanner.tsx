import { useEffect, useRef, useState, useCallback } from "react";
import { X, QrCode, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function QRScanner({ open, onClose, onScan }: QRScannerProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      setStarting(true);
      setError(null);

      await new Promise((r) => setTimeout(r, 300));

      if (!containerRef.current) return;

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          () => {
            // ignore scan failures
          },
        );
      } catch (err: any) {
        setError(err?.message || t("common.error"));
      } finally {
        setStarting(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [open, onScan, stopScanner, t]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <X size={22} />
        </button>
      </div>

      <div className="text-center mb-6">
        <QrCode className="mx-auto text-white/60 mb-3" size={32} />
        <h2 className="text-white text-lg font-display font-bold">
          {t("qr.scanTitle")}
        </h2>
        <p className="text-white/60 text-sm mt-1">
          {t("qr.scanDescription")}
        </p>
      </div>

      <div className="relative w-72 h-72 rounded-2xl overflow-hidden bg-black">
        {starting && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="text-white animate-spin" size={32} />
          </div>
        )}
        <div
          ref={containerRef}
          id="qr-reader"
          className="w-full h-full"
        />
        <div className="absolute inset-0 pointer-events-none border-2 border-white/30 rounded-2xl" />
      </div>

      {error && (
        <div className="mt-4 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
