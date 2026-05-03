import type {
  BlazeKind,
  Horse,
  HorseColoring,
  HorseVisual,
} from "../../src/domain/horse/types";
import { asHorseId } from "../../src/domain/shared/types";
import {
  HORSE_COLORINGS,
  HORSE_NAMES,
  SILK_ACCENT_COLORS,
  SILK_COLORS,
} from "../../src/domain/horse/constants";

export const buildColoring = (
  overrides: Partial<HorseColoring> = {}
): HorseColoring => ({
  body: "#8B5A2B",
  bodyDark: "#4F2E12",
  bodyLight: "#A8744A",
  mane: "#2B1A0A",
  blaze: "blaze" as BlazeKind,
  coatName: "Doru",
  ...overrides,
});

export const buildVisual = (
  overrides: Partial<HorseVisual> = {}
): HorseVisual => ({
  coloring: buildColoring(overrides.coloring),
  silkColor: overrides.silkColor ?? "#E63946",
  silkAccentColor: overrides.silkAccentColor ?? "#FFFFFF",
  silkPatternIndex: overrides.silkPatternIndex ?? 0,
});

export const buildHorse = (overrides: Partial<Horse> = {}): Horse => ({
  id: asHorseId(overrides.id ?? 1),
  name: overrides.name ?? "Aras",
  visual: overrides.visual ?? buildVisual(),
  condition: overrides.condition ?? 80,
});

export interface BuildHorsesOptions {
  readonly count?: number;
  readonly conditionFn?: (index: number) => number;
}

export const buildHorses = (options: BuildHorsesOptions = {}): Horse[] => {
  const count = options.count ?? 20;
  const conditionFn = options.conditionFn ?? (() => 80);
  return Array.from({ length: count }, (_, i): Horse => {
    const coloring = HORSE_COLORINGS[i % HORSE_COLORINGS.length];
    return {
      id: asHorseId(i + 1),
      name: HORSE_NAMES[i % HORSE_NAMES.length] ?? `Horse ${i + 1}`,
      visual: {
        coloring: coloring as HorseColoring,
        silkColor: SILK_COLORS[i % SILK_COLORS.length] ?? "#E63946",
        silkAccentColor:
          SILK_ACCENT_COLORS[i % SILK_ACCENT_COLORS.length] ?? "#FFFFFF",
        silkPatternIndex: i % 5,
      },
      condition: conditionFn(i),
    };
  });
};
