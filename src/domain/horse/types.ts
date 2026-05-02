import type { HorseId } from "../shared/types";

export type BlazeKind = "blaze" | "stripe" | "star" | "none";

export interface HorseColoring {
  readonly body: string;
  readonly bodyDark: string;
  readonly bodyLight: string;
  readonly mane: string;
  readonly blaze: BlazeKind;
  readonly coatName: string;
}

export interface HorseVisual {
  readonly coloring: HorseColoring;
  readonly silkColor: string;
  readonly silkAccentColor: string;
  readonly silkPatternIndex: number;
}

export interface HorseIdentity {
  readonly id: HorseId;
  readonly name: string;
  readonly visual: HorseVisual;
}

export interface HorseState {
  condition: number;
}

export interface Horse extends HorseIdentity, HorseState {}

export const MIN_CONDITION = 1 as const;
export const MAX_CONDITION = 100 as const;

export const clampCondition = (value: number): number =>
  Math.min(MAX_CONDITION, Math.max(MIN_CONDITION, Math.round(value)));
