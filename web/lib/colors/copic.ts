// Copic codes/hex/driveIds shared across Sketch, Ciao (subset of 180), and Ink.
// Image source priority (best → fallback):
//   1. copic-sketch-images.json  (Boykot's individual product photo, 358 codes)
//   2. driveId thumbnail         (Boykot's Drive folder, 131 codes — only used if (1) missing)
//   3. hex value                 (always present in copic-colors.json)
//
// scripts/build-copic-sketch-images.js regenerates (1) from scraped product pages.

import data from '../../public/copic-colors.json';
import sketchImages from '../../public/colors/copic-sketch-images.json';
import type { ColorSwatch } from './types';

interface RawCopic { code: string; hex: string; family: string; driveId?: string | null; }

const raw = (data as { colors: Record<string, RawCopic> }).colors;
const imageMap = sketchImages as Record<string, string>;

export const COPIC_FAMILY_ORDER = [
  '0', '100', 'B', 'BG', 'BV', 'C', 'E', 'FBG', 'FB', 'FRV', 'FV', 'FYG',
  'G', 'N', 'R', 'RV', 'T', 'V', 'W', 'Y', 'YG', 'YR',
];

export const COPIC_FAMILY_NAMES: Record<string, string> = {
  '0': 'Colorless', '100': 'Black',
  B: 'Blue', BG: 'Blue Green', BV: 'Blue Violet',
  C: 'Cool Gray', E: 'Earth',
  FB: 'Fluo Blue', FBG: 'Fluo Blue Green', FRV: 'Fluo Red Violet',
  FV: 'Fluo Violet', FYG: 'Fluo Yellow Green',
  G: 'Green', N: 'Neutral Gray', R: 'Red', RV: 'Red Violet',
  T: 'Toner Gray', V: 'Violet', W: 'Warm Gray',
  Y: 'Yellow', YG: 'Yellow Green', YR: 'Yellow Red',
};

export function copicFamily(code: string): string {
  // Sort longest-prefix-first so 'BV' is matched before 'B'.
  for (const p of [...COPIC_FAMILY_ORDER].sort((a, b) => b.length - a.length)) {
    if (code.startsWith(p) && (code.length === p.length || /\d/.test(code[p.length]))) return p;
  }
  return 'Other';
}

function sort(a: ColorSwatch, b: ColorSwatch): number {
  const fa = COPIC_FAMILY_ORDER.indexOf(copicFamily(a.code));
  const fb = COPIC_FAMILY_ORDER.indexOf(copicFamily(b.code));
  if (fa !== fb) return fa - fb;
  const na = parseFloat(a.code.replace(/^[A-Z]+/, '')) || 0;
  const nb = parseFloat(b.code.replace(/^[A-Z]+/, '')) || 0;
  return na - nb;
}

export const ALL_COPIC: ColorSwatch[] = Object.values(raw)
  .map(c => ({
    code: c.code,
    hex: c.hex,
    family: c.family,
    driveId: c.driveId || null,
    imageUrl: imageMap[c.code] || null,
  }))
  .sort(sort);

// Copic Ciao only ships 180 of the 358 codes. The subset is published officially.
// Keeping it here lets Sketch and Ink reuse ALL_COPIC unchanged.
export const CIAO_SUBSET = new Set([
  '0', '100',
  'B00', 'B02', 'B05', 'B12', 'B14', 'B16', 'B18', 'B21', 'B23', 'B24', 'B26', 'B28', 'B29',
  'B32', 'B34', 'B37', 'B39', 'B41', 'B45', 'B52', 'B60', 'B63', 'B66', 'B69', 'B91', 'B93', 'B95', 'B97', 'B99',
  'BG10', 'BG11', 'BG13', 'BG15', 'BG18', 'BG23', 'BG34', 'BG45', 'BG49', 'BG53', 'BG57', 'BG70', 'BG72', 'BG75', 'BG78', 'BG90',
  'BV00', 'BV01', 'BV02', 'BV04', 'BV08', 'BV11', 'BV13', 'BV17', 'BV20', 'BV23', 'BV25', 'BV29', 'BV31', 'BV34',
  'C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
  'E00', 'E02', 'E04', 'E07', 'E08', 'E11', 'E13', 'E15', 'E17', 'E18', 'E19', 'E21', 'E23', 'E25', 'E27', 'E29',
  'E30', 'E31', 'E33', 'E34', 'E35', 'E37', 'E39', 'E40', 'E41', 'E42', 'E43', 'E44', 'E47', 'E49', 'E50', 'E51', 'E53', 'E55', 'E57', 'E59',
  'E70', 'E71', 'E74', 'E77', 'E79', 'E81', 'E84', 'E87', 'E89', 'E93', 'E95', 'E97', 'E99',
  'G00', 'G02', 'G05', 'G07', 'G09', 'G12', 'G14', 'G17', 'G19', 'G20', 'G21', 'G24', 'G28', 'G29', 'G40', 'G82', 'G85', 'G94', 'G99',
  'N0', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10',
  'R00', 'R02', 'R05', 'R08', 'R11', 'R12', 'R14', 'R17', 'R20', 'R21', 'R22', 'R24', 'R27', 'R29', 'R30', 'R32', 'R35', 'R37', 'R39',
  'R43', 'R46', 'R56', 'R59', 'R81', 'R83', 'R85', 'R89',
  'RV02', 'RV04', 'RV06', 'RV09', 'RV11', 'RV13', 'RV14', 'RV17', 'RV19', 'RV21', 'RV23', 'RV25', 'RV29',
  'V01', 'V05', 'V09', 'V12', 'V15', 'V17', 'V20', 'V25', 'V28',
  'W1', 'W3', 'W5', 'W7',
  'Y00', 'Y02', 'Y04', 'Y06', 'Y08', 'Y11', 'Y13', 'Y15', 'Y17', 'Y18', 'Y19', 'Y21', 'Y23', 'Y26', 'Y28', 'Y35', 'Y38',
  'YG00', 'YG03', 'YG05', 'YG06', 'YG07', 'YG09', 'YG11', 'YG13', 'YG17', 'YG21', 'YG23', 'YG25', 'YG41', 'YG45', 'YG61', 'YG63', 'YG67', 'YG91', 'YG93', 'YG95', 'YG97',
  'YR00', 'YR02', 'YR04', 'YR07', 'YR09', 'YR12', 'YR14', 'YR15', 'YR16', 'YR18', 'YR20', 'YR21', 'YR23', 'YR24', 'YR27', 'YR31', 'YR61', 'YR65', 'YR68', 'YR82',
]);

export const COPIC_CIAO: ColorSwatch[] = ALL_COPIC.filter(c => CIAO_SUBSET.has(c.code));
