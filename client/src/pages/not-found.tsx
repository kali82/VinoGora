import { Wine } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-full flex items-center justify-center bg-background p-8">
      <div className="text-center">
        <Wine size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <h1 className="text-4xl font-display font-bold text-primary mb-2">
          404
        </h1>
        <p className="text-muted-foreground mb-6">{t("common.notFound")}</p>
        <Link href="/">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20">
            {t("common.goHome")}
          </button>
        </Link>
      </div>
    </div>
  );
}
