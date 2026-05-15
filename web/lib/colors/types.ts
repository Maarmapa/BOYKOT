export interface ColorSwatch {
  code: string;
  /** Optional — only Copic has reliable hex values. Others render as label-only placeholder. */
  hex?: string;
  /** Human-readable name when the code alone isn't descriptive (e.g. "Jasmin Yellow"). */
  name?: string;
  family?: string;
  /** Google Drive file id for the official swatch photo (Boykot's own scanned chip). */
  driveId?: string | null;
  /** Pre-rendered absolute image URL (overrides driveId-based thumbnail when present). */
  imageUrl?: string | null;
  /** BSale variant_id for stock + cart linkage. */
  variantId?: number;
  /** BSale variant SKU (EAN). */
  sku?: string;
}

export interface BrandColorSet {
  /** Internal slug for routing + storage paths. */
  slug: string;
  /** Display name on the page header. */
  productName: string;
  /** Unit price in CLP shown on each card before stock-aware overrides. */
  basePriceClp: number;
  /** BSale product_id for stock + cart linkage. */
  bsaleProductId: number;
  /** All colors, in display order. */
  colors: ColorSwatch[];
  /** Group ordering (e.g. ['B','BG','BV','C',...]) for the filter chips and sort. */
  familyOrder?: string[];
  /** Human-readable family names ({ B: 'Blue', BG: 'Blue Green', ... }). */
  familyNames?: Record<string, string>;
}
