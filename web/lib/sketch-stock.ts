// Mapea códigos Copic Sketch → stock en Providencia
// Lee del catalog.json estático (generado por extract-catalog.js)

export type StockMap = Record<string, number>;

export async function getSketchStock(): Promise<StockMap> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://boykot-api.onrender.com'}/api/sketch-stock`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}
