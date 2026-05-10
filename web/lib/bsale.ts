// lib/bsale.ts - Cliente BSale para Next.js
const API = process.env.NEXT_PUBLIC_API_URL || 'https://boykot-api.onrender.com';

export async function getProducts(params?: { limit?: number; offset?: number; type?: string }) {
  const q = new URLSearchParams({ limit: '50', offset: '0', ...params } as Record<string, string>);
  const res = await fetch(`${API}/api/products?${q}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Error cargando productos');
  return res.json();
}

export async function getStock(productId: string) {
  const res = await fetch(`${API}/api/stock/product/${productId}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API}/api/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Error cargando categorías');
  return res.json();
}
