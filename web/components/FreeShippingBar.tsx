interface Props {
  currentClp: number;
  thresholdClp?: number;
}

export default function FreeShippingBar({ currentClp, thresholdClp = 50000 }: Props) {
  const reached = currentClp >= thresholdClp;
  const pct = Math.min(100, (currentClp / thresholdClp) * 100);
  const missing = Math.max(0, thresholdClp - currentClp);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between text-xs mb-2">
        {reached ? (
          <span className="font-semibold text-emerald-700">
            🎉 ¡Tenés envío gratis!
          </span>
        ) : (
          <span className="text-gray-700">
            Te faltan <strong className="text-gray-900">${missing.toLocaleString('es-CL')}</strong> para envío gratis
          </span>
        )}
        <span className="font-mono text-gray-500">
          ${currentClp.toLocaleString('es-CL')} / ${thresholdClp.toLocaleString('es-CL')}
        </span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${reached ? 'bg-emerald-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
