import type { BrandColorSet, ColorSwatch } from './types';
import { ALL_COPIC, COPIC_CIAO, COPIC_FAMILY_ORDER, COPIC_FAMILY_NAMES } from './copic';
import molotowPremium from '../../public/colors/molotow-premium.json';
import molotowPremiumNeon from '../../public/colors/molotow-premium-neon.json';
import molotowPremiumPlus from '../../public/colors/molotow-premium-plus.json';

function fromBsaleJson(data: { colors: ColorSwatch[] }): ColorSwatch[] {
  return data.colors.map(c => ({ ...c }));
}

export const BRANDS: Record<string, BrandColorSet> = {
  'copic-sketch': {
    slug: 'copic-sketch',
    productName: 'Copic Sketch',
    basePriceClp: 4300,
    bsaleProductId: 2278,
    colors: ALL_COPIC,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'copic-ink': {
    slug: 'copic-ink',
    productName: 'COPIC Ink',
    basePriceClp: 4900,
    bsaleProductId: 2978,
    colors: ALL_COPIC,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'copic-ciao': {
    slug: 'copic-ciao',
    productName: 'Copic Ciao',
    basePriceClp: 3900,
    bsaleProductId: 2279,
    colors: COPIC_CIAO,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'molotow-premium': {
    slug: 'molotow-premium',
    productName: 'Molotow Premium 400ml',
    basePriceClp: 6000,
    bsaleProductId: 2236,
    colors: fromBsaleJson(molotowPremium),
  },
  'molotow-premium-neon': {
    slug: 'molotow-premium-neon',
    productName: 'Molotow Premium Neon 400ml',
    basePriceClp: 6000,
    bsaleProductId: 2238,
    colors: fromBsaleJson(molotowPremiumNeon),
  },
  'molotow-premium-plus': {
    slug: 'molotow-premium-plus',
    productName: 'Molotow Premium Plus 400ml',
    basePriceClp: 7900,
    bsaleProductId: 2239,
    colors: fromBsaleJson(molotowPremiumPlus),
  },
};
