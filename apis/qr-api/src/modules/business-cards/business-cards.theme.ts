import { createHash } from "node:crypto";
import type { BusinessCardTheme, CardThemePreset } from "@r6/schemas";

interface ThemePalette {
  backgroundStart: string;
  backgroundEnd: string;
  metallic: string;
  glow: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  panelBackground: string;
  bleed: string;
}

export interface ResolvedBusinessCardTheme {
  palette: ThemePalette;
  metallicStrength: number;
  glossStrength: number;
  holographicShift: number;
  shimmerPhase: number;
}

const PRESET_PALETTES: Record<CardThemePreset, ThemePalette> = {
  AURORA_GLASS: {
    backgroundStart: "#12233f",
    backgroundEnd: "#2f1748",
    metallic: "#b7c8ff",
    glow: "#67e8f9",
    accent: "#38bdf8",
    textPrimary: "#f9fbff",
    textSecondary: "#c0d3ff",
    panelBackground: "#ffffff24",
    bleed: "#0f1d34",
  },
  OBSIDIAN_GOLD: {
    backgroundStart: "#15120f",
    backgroundEnd: "#2f2619",
    metallic: "#ffd58d",
    glow: "#fbbf24",
    accent: "#f59e0b",
    textPrimary: "#fff7e8",
    textSecondary: "#f2d7a2",
    panelBackground: "#ffffff14",
    bleed: "#120f0b",
  },
  HOLO_CHROME: {
    backgroundStart: "#181f3d",
    backgroundEnd: "#2d1352",
    metallic: "#d2ddff",
    glow: "#a5b4fc",
    accent: "#6ee7f9",
    textPrimary: "#fbfdff",
    textSecondary: "#cdd8f4",
    panelBackground: "#ffffff1e",
    bleed: "#121933",
  },
};

function toShimmerPhase(seedText: string): number {
  const hash = createHash("sha256").update(seedText).digest();
  return (hash[0] ?? 0) / 255;
}

function normalizeHex(value: string | undefined, fallback: string): string {
  return value ?? fallback;
}

export function resolveBusinessCardTheme(
  theme: BusinessCardTheme,
  seedText: string,
): ResolvedBusinessCardTheme {
  const preset = PRESET_PALETTES[theme.preset];

  return {
    palette: {
      ...preset,
      backgroundStart: normalizeHex(theme.primaryHex, preset.backgroundStart),
      backgroundEnd: normalizeHex(theme.secondaryHex, preset.backgroundEnd),
      accent: normalizeHex(theme.accentHex, preset.accent),
    },
    metallicStrength: theme.metallicStrength,
    glossStrength: theme.glossStrength,
    holographicShift: theme.holographicShift,
    shimmerPhase: toShimmerPhase(seedText),
  };
}
