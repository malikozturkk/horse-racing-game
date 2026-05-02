export type BlazeKind = "blaze" | "stripe" | "star" | "none";

export interface HorseColoring {
  body: string;
  bodyDark: string;
  bodyLight: string;
  mane: string;
  blaze: BlazeKind;
  coatName: string;
}

export interface HorseVisual {
  coloring: HorseColoring;
  silkColor: string;
  silkAccentColor: string;
  silkPatternIndex: number;
}

export interface HorseIdentity {
  readonly id: number;
  readonly name: string;
  readonly visual: HorseVisual;
}

export interface HorseState {
  condition: number;
}

export interface Horse extends HorseIdentity {
  condition: number;
}
