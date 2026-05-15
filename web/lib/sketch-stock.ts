// Mapea códigos Copic Sketch → stock en Providencia.
// Tagged for on-demand invalidation by the BSale webhook
// (see app/api/webhooks/bsale/route.ts).

export type StockMap = Record<string, number>;

export async function getSketchStock(): Promise<StockMap> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://boykot-api.onrender.com'}/api/sketch-stock`, {
      next: { tags: ['stock:all', 'stock:sketch'], revalidate: 3600 },
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
