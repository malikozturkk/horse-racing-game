import type { RoundIndex } from "./types";

export const SCHEDULE_DISTANCES: readonly [
  number,
  number,
  number,
  number,
  number,
  number,
] = [1200, 1400, 1600, 1800, 2000, 2200] as const;

export const ROUND_NAMES: readonly [
  string,
  string,
  string,
  string,
  string,
  string,
] = [
  "Açılış Koşusu",
  "Sprint Kupası",
  "Mil Yarışı",
  "Orta Mesafe",
  "Yıldız Koşusu",
  "Büyük Final",
] as const;

export const TOTAL_ROUNDS = 6 as const;
export const HORSES_PER_ROUND = 10 as const;
export const ROUND_INDICES: readonly RoundIndex[] = [0, 1, 2, 3, 4, 5] as const;
