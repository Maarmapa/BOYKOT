// Thin compat wrapper — most code now consumes lib/bsale-api.ts directly.
// Kept for places that imported the older interface.

export { findVariantByCode, getProduct, fetchVariantPrice } from './bsale-api';
export { getProductStock, getVariantStock } from './stock';
