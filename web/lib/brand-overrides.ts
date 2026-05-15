// Brand overrides — metadata editable via /admin que se mergea encima de
// lo definido estáticamente en lib/colors/brands.ts. Sirve para cambiar
// precios/descripción/heroImage/visibility sin redeploy.
//
// Storage: tabla Supabase brand_overrides (PRIMARY KEY slug).

import { supabaseAdmin } from './supabase';

export interface BrandOverride {
  slug: string;
  base_price_clp: number | null;
  description: string | null;
  hero_image: string | null;
  hidden: boolean;
  display_name: string | null;
  updated_at: string;
}

export type BrandOverrideUpdate = Partial<Omit<BrandOverride, 'slug' | 'updated_at'>>;

/**
 * Load all overrides as a Map<slug, override>. Si la query falla (Supabase
 * down, env vars missing) devolvemos un Map vacío — el sitio sigue
 * funcionando con la metadata estática.
 */
export async function loadAllOverrides(): Promise<Map<string, BrandOverride>> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('brand_overrides')
      .select('*');
    if (error) {
      console.warn('[brand-overrides] load failed:', error.message);
      return new Map();
    }
    const map = new Map<string, BrandOverride>();
    for (const row of (data as BrandOverride[]) ?? []) {
      map.set(row.slug, row);
    }
    return map;
  } catch (e) {
    console.warn('[brand-overrides] load error:', (e as Error).message);
    return new Map();
  }
}

export async function getOverride(slug: string): Promise<BrandOverride | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('brand_overrides')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) return null;
    return (data as BrandOverride) ?? null;
  } catch {
    return null;
  }
}

export async function saveOverride(slug: string, patch: BrandOverrideUpdate): Promise<BrandOverride | null> {
  const payload: Record<string, unknown> = { slug, updated_at: new Date().toISOString() };
  if ('base_price_clp' in patch) payload.base_price_clp = patch.base_price_clp ?? null;
  if ('description' in patch) payload.description = patch.description ?? null;
  if ('hero_image' in patch) payload.hero_image = patch.hero_image ?? null;
  if ('hidden' in patch) payload.hidden = patch.hidden ?? false;
  if ('display_name' in patch) payload.display_name = patch.display_name ?? null;

  const { data, error } = await supabaseAdmin()
    .from('brand_overrides')
    .upsert(payload, { onConflict: 'slug' })
    .select()
    .single();
  if (error) {
    throw new Error(`saveOverride failed: ${error.message}`);
  }
  return data as BrandOverride;
}

/**
 * Apply override fields to a brand object. Returns the merged shape with
 * override fields taking priority (when non-null). Original `brand` is not
 * mutated.
 */
export function applyOverride<B extends {
  basePriceClp?: number;
  description?: string;
  heroImage?: string;
  productName?: string;
}>(brand: B, override: BrandOverride | null | undefined): B & { _hidden?: boolean } {
  if (!override) return brand;
  return {
    ...brand,
    basePriceClp: override.base_price_clp ?? brand.basePriceClp,
    description: override.description ?? brand.description,
    heroImage: override.hero_image ?? brand.heroImage,
    productName: override.display_name ?? brand.productName,
    _hidden: override.hidden,
  };
}

export async function deleteOverride(slug: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from('brand_overrides')
    .delete()
    .eq('slug', slug);
  if (error) throw new Error(`deleteOverride failed: ${error.message}`);
}
