import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserComment } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";

interface CheckIn {
  id: string;
  targetType: "vineyard" | "cellar" | "festival";
  targetId: string;
  method: "gps" | "qr";
  timestamp: string;
  photoUrl?: string;
}

interface GameState {
  points: number;
  favoriteWineIds: string[];
  wineNotes: Record<string, string>;
  comments: UserComment[];
  checkIns: CheckIn[];
  unlockedBadgeIds: string[];
  visitedVineyardIds: string[];
  visitedCellarIds: string[];
}

type GameAction =
  | { type: "ADD_POINTS"; payload: number }
  | { type: "SET_FAVORITES"; payload: string[] }
  | { type: "TOGGLE_FAVORITE_WINE"; payload: string }
  | { type: "ADD_COMMENT"; payload: UserComment }
  | { type: "SET_COMMENTS"; payload: { key: string; comments: UserComment[] } }
  | { type: "ADD_CHECKIN"; payload: CheckIn }
  | { type: "UNLOCK_BADGE"; payload: string }
  | { type: "SET_WINE_NOTE"; payload: { wineId: string; note: string } }
  | { type: "LOAD_STATE"; payload: GameState }
  | { type: "MERGE_PROFILE"; payload: Partial<GameState> };

const STORAGE_KEY = "vinogora_game_state";

const initialState: GameState = {
  points: 0,
  favoriteWineIds: [],
  wineNotes: {},
  comments: [],
  checkIns: [],
  unlockedBadgeIds: [],
  visitedVineyardIds: [],
  visitedCellarIds: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_POINTS":
      return { ...state, points: state.points + action.payload };

    case "SET_FAVORITES":
      return { ...state, favoriteWineIds: action.payload };

    case "TOGGLE_FAVORITE_WINE": {
      const id = action.payload;
      const exists = state.favoriteWineIds.includes(id);
      return {
        ...state,
        favoriteWineIds: exists
          ? state.favoriteWineIds.filter((w) => w !== id)
          : [...state.favoriteWineIds, id],
      };
    }

    case "ADD_COMMENT":
      return { ...state, comments: [...state.comments, action.payload] };

    case "SET_COMMENTS": {
      const filtered = state.comments.filter(
        (c) => `${c.targetType}:${c.targetId}` !== action.payload.key
      );
      return { ...state, comments: [...filtered, ...action.payload.comments] };
    }

    case "ADD_CHECKIN": {
      const checkin = action.payload;
      const newVisitedVineyards =
        checkin.targetType === "vineyard" &&
        !state.visitedVineyardIds.includes(checkin.targetId)
          ? [...state.visitedVineyardIds, checkin.targetId]
          : state.visitedVineyardIds;
      const newVisitedCellars =
        checkin.targetType === "cellar" &&
        !state.visitedCellarIds.includes(checkin.targetId)
          ? [...state.visitedCellarIds, checkin.targetId]
          : state.visitedCellarIds;
      return {
        ...state,
        checkIns: [...state.checkIns, checkin],
        visitedVineyardIds: newVisitedVineyards,
        visitedCellarIds: newVisitedCellars,
      };
    }

    case "UNLOCK_BADGE":
      return state.unlockedBadgeIds.includes(action.payload)
        ? state
        : {
            ...state,
            unlockedBadgeIds: [...state.unlockedBadgeIds, action.payload],
          };

    case "SET_WINE_NOTE": {
      const { wineId, note } = action.payload;
      const notes = { ...state.wineNotes };
      if (note.trim()) {
        notes[wineId] = note.trim();
      } else {
        delete notes[wineId];
      }
      return { ...state, wineNotes: notes };
    }

    case "LOAD_STATE":
      return { ...initialState, ...action.payload, wineNotes: action.payload.wineNotes ?? {} };

    case "MERGE_PROFILE": {
      const mergeUnique = (local: string[], remote?: string[]) =>
        remote ? Array.from(new Set([...local, ...remote])) : local;
      return {
        ...state,
        points: Math.max(state.points, action.payload.points ?? 0),
        favoriteWineIds: mergeUnique(state.favoriteWineIds, action.payload.favoriteWineIds),
        unlockedBadgeIds: mergeUnique(state.unlockedBadgeIds, action.payload.unlockedBadgeIds),
        visitedVineyardIds: mergeUnique(state.visitedVineyardIds, action.payload.visitedVineyardIds),
        visitedCellarIds: mergeUnique(state.visitedCellarIds, action.payload.visitedCellarIds),
      };
    }

    default:
      return state;
  }
}

function evaluateBadges(state: GameState): string[] {
  const earned: string[] = [];

  if (state.visitedVineyardIds.length >= 1) earned.push("first-sip");
  if (state.visitedVineyardIds.length >= 5) earned.push("explorer");
  if (state.visitedVineyardIds.length >= 6) earned.push("sommelier");

  const ratedWineCount = new Set(
    state.comments.filter((c) => c.targetType === "wine").map((c) => c.targetId)
  ).size;
  if (ratedWineCount >= 10) earned.push("connoisseur");

  if (state.favoriteWineIds.length >= 20) earned.push("collector");

  if (state.checkIns.some((c) => c.targetType === "festival"))
    earned.push("festival-goer");

  if (state.visitedCellarIds.length >= 6) earned.push("trail-master");

  const photoCount = state.checkIns.filter((c) => c.photoUrl).length;
  if (photoCount >= 10) earned.push("photographer");

  return earned;
}

interface GameContextValue {
  state: GameState;
  addPoints: (pts: number) => void;
  toggleFavoriteWine: (wineId: string, userId?: string) => void;
  isFavoriteWine: (wineId: string) => boolean;
  setWineNote: (wineId: string, note: string) => void;
  getWineNote: (wineId: string) => string;
  addComment: (comment: Omit<UserComment, "id" | "createdAt">) => void;
  getComments: (targetType: string, targetId: string) => UserComment[];
  fetchComments: (targetType: string, targetId: string) => Promise<UserComment[]>;
  addCheckIn: (
    targetType: "vineyard" | "cellar" | "festival",
    targetId: string,
    method: "gps" | "qr",
    photoUrl?: string,
    userId?: string,
    latitude?: number,
    longitude?: number
  ) => void;
  canCheckIn: (targetId: string) => boolean;
  syncProfile: (userId: string, displayName: string, email?: string, photoUrl?: string) => void;
  level: number;
  pointsToNextLevel: number;
  progressPercent: number;
}

const POINTS_PER_LEVEL = 200;

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: "LOAD_STATE", payload: JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const earned = evaluateBadges(state);
    earned.forEach((badgeId) => {
      if (!state.unlockedBadgeIds.includes(badgeId)) {
        dispatch({ type: "UNLOCK_BADGE", payload: badgeId });
      }
    });
  }, [
    state.visitedVineyardIds,
    state.visitedCellarIds,
    state.comments,
    state.favoriteWineIds,
    state.checkIns,
    state.unlockedBadgeIds,
  ]);

  const addPoints = useCallback(
    (pts: number) => dispatch({ type: "ADD_POINTS", payload: pts }),
    []
  );

  const toggleFavoriteWine = useCallback(
    (wineId: string, userId?: string) => {
      dispatch({ type: "TOGGLE_FAVORITE_WINE", payload: wineId });
      if (userId) {
        apiRequest("POST", "/api/favorites", { userId, wineId }).catch(() => {});
      }
    },
    []
  );

  const isFavoriteWine = useCallback(
    (wineId: string) => state.favoriteWineIds.includes(wineId),
    [state.favoriteWineIds]
  );

  const setWineNote = useCallback(
    (wineId: string, note: string) =>
      dispatch({ type: "SET_WINE_NOTE", payload: { wineId, note } }),
    []
  );

  const getWineNote = useCallback(
    (wineId: string) => state.wineNotes[wineId] ?? "",
    [state.wineNotes]
  );

  const addComment = useCallback(
    (comment: Omit<UserComment, "id" | "createdAt">) => {
      const full: UserComment = {
        ...comment,
        id: `comment-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_COMMENT", payload: full });
      dispatch({ type: "ADD_POINTS", payload: 30 });

      apiRequest("POST", `/api/comments/${comment.targetType}/${comment.targetId}`, {
        userId: comment.userId,
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        rating: comment.rating,
        text: comment.text,
        photoUrl: comment.photoUrl,
      }).catch(() => {});
    },
    []
  );

  const getComments = useCallback(
    (targetType: string, targetId: string) =>
      state.comments.filter(
        (c) => c.targetType === targetType && c.targetId === targetId
      ),
    [state.comments]
  );

  const fetchComments = useCallback(
    async (targetType: string, targetId: string): Promise<UserComment[]> => {
      try {
        const res = await fetch(`/api/comments/${targetType}/${targetId}`);
        if (res.ok) {
          const serverComments: UserComment[] = await res.json();
          dispatch({
            type: "SET_COMMENTS",
            payload: { key: `${targetType}:${targetId}`, comments: serverComments },
          });
          return serverComments;
        }
      } catch {
        // offline - fall back to local
      }
      return state.comments.filter(
        (c) => c.targetType === targetType && c.targetId === targetId
      );
    },
    [state.comments]
  );

  const canCheckIn = useCallback(
    (targetId: string) => {
      const last = state.checkIns
        .filter((c) => c.targetId === targetId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
      if (!last) return true;
      const hoursSince =
        (Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60);
      return hoursSince >= 24;
    },
    [state.checkIns]
  );

  const addCheckIn = useCallback(
    (
      targetType: "vineyard" | "cellar" | "festival",
      targetId: string,
      method: "gps" | "qr",
      photoUrl?: string,
      userId?: string,
      latitude?: number,
      longitude?: number
    ) => {
      const checkin: CheckIn = {
        id: `checkin-${Date.now()}`,
        targetType,
        targetId,
        method,
        timestamp: new Date().toISOString(),
        photoUrl,
      };
      dispatch({ type: "ADD_CHECKIN", payload: checkin });
      const pts = targetType === "festival" ? 75 : 50;
      dispatch({ type: "ADD_POINTS", payload: pts });

      if (userId) {
        if (method === "gps") {
          apiRequest("POST", "/api/checkin", {
            userId, targetType, targetId, latitude, longitude, photoUrl,
          }).catch(() => {});
        } else {
          apiRequest("POST", "/api/checkin/qr", {
            userId, qrPayload: JSON.stringify({ targetType, targetId }),
          }).catch(() => {});
        }
      }
    },
    []
  );

  const syncProfile = useCallback(
    (userId: string, displayName: string, email?: string, photoUrl?: string) => {
      const localState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<GameState>;
      apiRequest("POST", "/api/auth/verify", {
        uid: userId,
        displayName,
        email,
        photoUrl,
        localPoints: localState.points ?? 0,
        localFavoriteWineIds: localState.favoriteWineIds ?? [],
        localUnlockedBadgeIds: localState.unlockedBadgeIds ?? [],
        localVisitedVineyardIds: localState.visitedVineyardIds ?? [],
        localVisitedCellarIds: localState.visitedCellarIds ?? [],
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            dispatch({
              type: "MERGE_PROFILE",
              payload: {
                points: data.profile.points,
                favoriteWineIds: data.profile.favoriteWineIds,
                unlockedBadgeIds: data.profile.unlockedBadgeIds,
                visitedVineyardIds: data.profile.visitedVineyardIds,
                visitedCellarIds: data.profile.visitedCellarIds,
              },
            });
          }
        })
        .catch((err) => {
          console.error("[syncProfile] failed:", err);
        });
    },
    []
  );

  const level = Math.floor(state.points / POINTS_PER_LEVEL) + 1;
  const pointsInCurrentLevel = state.points % POINTS_PER_LEVEL;
  const progressPercent = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
  const pointsToNextLevel = POINTS_PER_LEVEL - pointsInCurrentLevel;

  return (
    <GameContext.Provider
      value={{
        state,
        addPoints,
        toggleFavoriteWine,
        isFavoriteWine,
        setWineNote,
        getWineNote,
        addComment,
        getComments,
        fetchComments,
        addCheckIn,
        canCheckIn,
        syncProfile,
        level,
        pointsToNextLevel,
        progressPercent,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGameContext must be used within GameProvider");
  return ctx;
}
