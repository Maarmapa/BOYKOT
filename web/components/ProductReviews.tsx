import type { Review } from '@/lib/reviews';

interface Props {
  reviews: Review[];
  summary: {
    count: number;
    average: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  } | null;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? '#f59e0b' : '#e5e7eb'}
      stroke={filled ? '#f59e0b' : '#d1d5db'}
      strokeWidth="1"
    >
      <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
    </svg>
  );
}

export default function ProductReviews({ reviews, summary }: Props) {
  if (!summary || summary.count === 0) {
    return (
      <section className="border-t border-gray-100 mt-12 pt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Reseñas</h2>
        <p className="text-sm text-gray-500">
          Aún no hay reseñas para este producto. Si lo compraste, dejá la primera.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-gray-100 mt-12 pt-10">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Reseñas ({summary.count})
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="text-center sm:col-span-1">
          <div className="text-5xl font-bold text-gray-900">{summary.average.toFixed(1)}</div>
          <div className="flex justify-center items-center gap-0.5 my-1">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} filled={n <= Math.round(summary.average)} />
            ))}
          </div>
          <div className="text-xs text-gray-500">{summary.count} reseñas</div>
        </div>

        <div className="sm:col-span-2 space-y-1">
          {([5, 4, 3, 2, 1] as const).map(n => {
            const count = summary.distribution[n];
            const pct = summary.count > 0 ? (count / summary.count) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3 text-xs">
                <div className="w-8 text-right text-gray-600">{n} ★</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-right text-gray-500">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-5">
        {reviews.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => <Star key={n} filled={n <= r.rating} />)}
                  </div>
                  {r.verified_purchase && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                      ✓ Compra verificada
                    </span>
                  )}
                </div>
                {r.title && <div className="font-bold text-gray-900 text-sm">{r.title}</div>}
              </div>
              <div className="text-xs text-gray-500 text-right flex-shrink-0">
                <div className="font-medium">{r.customer_name || 'Anónimo'}</div>
                <div>{new Date(r.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
            {r.body && <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-2">{r.body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
