import { useState, useEffect } from "react";

interface RatingData {
  average: number;
  count: number;
}

export function useRating(
  targetType: string,
  targetId: string,
  staticRating?: number,
  staticCount?: number
) {
  const [data, setData] = useState<RatingData>({
    average: staticRating ?? 0,
    count: staticCount ?? 0,
  });

  useEffect(() => {
    fetch(`/api/ratings/${targetType}/${targetId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: RatingData) => {
        if (d.count > 0) {
          setData(d);
        }
      })
      .catch(() => {});
  }, [targetType, targetId]);

  return data;
}
