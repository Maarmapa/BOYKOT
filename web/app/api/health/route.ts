// Health check / env diagnostic publico.
// Devuelve que env vars estan seteadas (booleans + prefix corto), sin leak de values.
// Safe para exponer publicamente.
//
//   GET /api/health
//
// Aliasa /api/_diagnose pero con nombre canonical.

export { GET } from '../_diagnose/route';
