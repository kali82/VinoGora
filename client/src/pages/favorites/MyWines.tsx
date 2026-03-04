import { useMemo, useState } from "react";
import {
  Wine,
  Star,
  StarHalf,
  Heart,
  Trash2,
  ChevronRight,
  Pencil,
  Check,
  StickyNote,
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLocalized } from "@/hooks/use-localized";
import { wines as allWines } from "@shared/data/wines";
import { vineyards } from "@shared/data/vineyards";
import { useGameContext } from "@/contexts/GameContext";

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star key={i} size={14} className="text-accent fill-accent" />
      );
    } else if (i - 0.5 <= rating) {
      stars.push(
        <StarHalf key={i} size={14} className="text-accent fill-accent" />
      );
    } else {
      stars.push(
        <Star key={i} size={14} className="text-muted-foreground/30" />
      );
    }
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

function NoteEditor({
  wineId,
  note,
  onSave,
}: {
  wineId: string;
  note: string;
  onSave: (wineId: string, text: string) => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  const handleSave = () => {
    onSave(wineId, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mt-3 flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("favorites.notePlaceholder")}
          className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[60px]"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shrink-0 self-end active:scale-95 transition-transform"
        >
          <Check size={16} />
        </button>
      </div>
    );
  }

  if (note) {
    return (
      <button
        onClick={() => { setDraft(note); setEditing(true); }}
        className="mt-3 flex items-start gap-2 w-full text-left group"
      >
        <StickyNote size={13} className="text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground italic flex-1 line-clamp-2">
          {note}
        </p>
        <Pencil size={12} className="text-muted-foreground/50 group-hover:text-primary shrink-0 mt-0.5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => { setDraft(""); setEditing(true); }}
      className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
    >
      <Pencil size={12} />
      {t("favorites.addNote")}
    </button>
  );
}

export default function MyWines() {
  const { t } = useTranslation();
  const { t: tl } = useLocalized();
  const { state, toggleFavoriteWine, setWineNote, getWineNote } = useGameContext();

  const favoriteWines = useMemo(
    () =>
      allWines.filter((w) => state.favoriteWineIds.includes(w.id)),
    [state.favoriteWineIds]
  );

  const getVineyardName = (vineyardId: string) =>
    vineyards.find((v) => v.id === vineyardId)?.name ?? "";

  const wineTypeColor = (type: string) => {
    switch (type) {
      case "red":
        return "bg-red-700";
      case "rose":
        return "bg-pink-400";
      case "sparkling":
        return "bg-amber-300";
      default:
        return "bg-amber-100 border border-amber-300";
    }
  };

  return (
    <div className="min-h-full bg-background pb-24">
      <div className="p-5 pt-safe-top">
        <h1 className="text-3xl font-display font-bold mb-2">
          {t("favorites.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("favorites.subtitle")}
        </p>
      </div>

      <div className="px-5 space-y-4">
        {favoriteWines.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-muted-foreground">
              {t("favorites.noFavorites")}
            </p>
            <Link href="/directory">
              <button className="mt-4 text-primary font-semibold text-sm">
                {t("favorites.browseDirectory")}
              </button>
            </Link>
          </div>
        ) : (
          favoriteWines.map((wine) => (
            <div
              key={wine.id}
              className="bg-card p-5 rounded-3xl border border-border shadow-sm"
            >
              <Link href={`/wines/${wine.id}`}>
                <div className="flex justify-between items-start mb-2 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${wineTypeColor(wine.type)}`}
                      />
                      <h3 className="font-bold text-lg font-display truncate">
                        {wine.name}
                      </h3>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-sm text-primary font-medium mt-0.5">
                      {getVineyardName(wine.vineyardId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {wine.grape}
                      {wine.year ? ` • ${wine.year}` : ""}
                    </p>
                  </div>
                  {wine.rating && <StarRating rating={wine.rating} />}
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {tl(wine.description)}
                </p>
              </Link>

              <NoteEditor
                wineId={wine.id}
                note={getWineNote(wine.id)}
                onSave={setWineNote}
              />

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => toggleFavoriteWine(wine.id)}
                  className="text-sm font-semibold text-destructive/70 bg-destructive/5 px-4 py-2 rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  {t("directory.removeFromFavorites")}
                </button>
              </div>
            </div>
          ))
        )}

        {favoriteWines.length > 0 && (
          <Link href="/directory">
            <div className="border-2 border-dashed border-border rounded-3xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors">
              <Wine
                size={32}
                className="mx-auto text-muted-foreground/50 mb-3"
              />
              <p className="font-semibold text-muted-foreground">
                {t("favorites.addMore")}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {t("favorites.browseDirectory")}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
