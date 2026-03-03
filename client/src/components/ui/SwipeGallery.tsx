import { useState, useRef, useCallback } from "react";

interface SwipeGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SwipeGallery({
  images,
  alt,
  className = "h-72",
  children,
}: SwipeGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchDelta = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(i, images.length - 1))),
    [images.length],
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchDelta.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current.x;
  }, []);

  const onTouchEnd = useCallback(() => {
    const threshold = 50;
    if (touchDelta.current < -threshold) {
      goTo(index + 1);
    } else if (touchDelta.current > threshold) {
      goTo(index - 1);
    }
    touchStart.current = null;
    touchDelta.current = 0;
  }, [index, goTo]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-muted overflow-hidden ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} ${i + 1}`}
            className="w-full h-full object-cover shrink-0"
            draggable={false}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === index ? "bg-white w-5" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
