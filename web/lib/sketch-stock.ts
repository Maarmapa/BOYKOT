// Mapea códigos Copic Sketch → stock disponible en Providencia.
// Antes vivía en boykot-api.onrender.com/api/sketch-stock (que no existía).
// Ahora pega directo a BSale usando lib/bsale-api.ts y el catálogo local
// para resolver code → variantId.

import { fetchProductStock } from './bsale-api';
import { BRANDS } from './colors/brands';

export type StockMap = Record<string, number>;

const OFFICE_ID = process.env.BSALE_OFFICE_ID ? Number(process.env.BSALE_OFFICE_ID) : undefined;

/**
 * Devuelve un mapa { [colorCode]: availableQty } para Copic Sketch.
 * Si BSALE_ACCESS_TOKEN no está configurado, devuelve {} silenciosamente
 * (el grid asume in-stock).
 */
export async function getSketchStock(): Promise<StockMap> {
  if (!process.env.BSALE_ACCESS_TOKEN) return {};
  const sketch = BRANDS['copic-sketch'];
  if (!sketch?.bsaleProductId) return {};

  try {
    const variantMap = await fetchProductStock(sketch.bsaleProductId, { officeId: OFFICE_ID });
    const result: StockMap = {};
    for (const c of sketch.colors) {
      if (!c.variantId) continue;
      const qty = variantMap.get(c.variantId);
      if (qty !== undefined) result[c.code] = qty;
    }
    return result;
  } catch {
    return {};
  }
}
