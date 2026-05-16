import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagos Agentic · Boykot — Primer retail chileno con x402',
  description:
    'Boykot acepta pagos agentic vía protocolo x402 (HTTP 402 Payment Required, USDC sobre Base). Comprar materiales de arte directo desde agentes AI sin intervención humana.',
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export default function AgenticPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark con código */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider rounded-full mb-6 border border-blue-500/40">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Lab · Pre-launch
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 leading-tight font-bold">
            Boykot acepta pagos
            <br />
            <span className="text-blue-400">agentic</span>.
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8">
            Primer retail chileno integrado con el protocolo <strong className="text-white">x402</strong>:
            agentes AI pueden descubrir + comprar materiales de arte autónomamente,
            sin intermediario humano. Pagos en USDC sobre Base.
          </p>
          <div className="bg-gray-950/80 border border-gray-800 rounded-lg p-5 font-mono text-xs sm:text-sm overflow-x-auto">
            <div className="text-gray-500 mb-2">$ curl agent-compatible request</div>
            <div className="text-gray-100 whitespace-pre">
              <span className="text-blue-400">GET</span> {SITE}/api/agentic/buy?slug=copic-sketch-b01&qty=2
            </div>
            <div className="text-gray-500 mt-3 mb-2"># Response: HTTP 402 Payment Required</div>
            <div className="text-gray-300 whitespace-pre">{`{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base-mainnet",
    "asset": "USDC",
    "maxAmountRequired": "8600000",
    "payTo": "0x...",
    "resource": "${SITE}/api/agentic/buy?..."
  }]
}`}</div>
          </div>
        </div>
      </section>

      {/* ¿Qué es x402? */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Qué es esto
          </div>
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-6 leading-tight">
            HTTP 402 Payment Required — finalmente útil después de 33 años.
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              En 1992, los creadores del HTTP reservaron el código de estado{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">402 Payment Required</code> "para uso futuro". Tres décadas
              después, Coinbase lo activó con el protocolo{' '}
              <a
                href="https://www.x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                x402
              </a>:
              cualquier endpoint HTTP puede pedir pago en stablecoin antes de servir contenido.
            </p>
            <p>
              Para nosotros eso significa que un agente AI (Claude, GPT, lo que sea) puede:
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Descubrir un producto Boykot vía catálogo público</li>
              <li>Hacer GET al endpoint <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">/api/agentic/buy</code></li>
              <li>Recibir un <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">402</code> con la cantidad de USDC requerida</li>
              <li>Firmar la transacción en Base sin pedirle wallet al usuario humano</li>
              <li>Reintentar con el header <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">X-PAYMENT</code></li>
              <li>Recibir el producto + receipt verificable on-chain</li>
            </ol>
            <p>
              <strong className="text-gray-900">Cero intervención humana, cero saldo en plataforma intermedia, cero comisión MP.</strong>{' '}
              Solo el agente, USDC, y Boykot.
            </p>
          </div>
        </div>
      </section>

      {/* Por qué Boykot lo activa primero */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Por qué Boykot
          </div>
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-8 leading-tight">
            Listos antes que el mercado.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl mb-2">🇨🇱</div>
              <div className="font-bold text-gray-900 mb-1">Primer retail chileno</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cuando los agentes AI empiecen a comprar en serio (2027+), ya estamos listos.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-bold text-gray-900 mb-1">Cero overhead</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                El flow agentic NUNCA llega a un humano. El agente compra, BSale despacha, fin.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-bold text-gray-900 mb-1">Materiales de arte</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Si un agente de diseño necesita Copic Sketch B01 para renderizar, lo compra solo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status técnico */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Status técnico
          </div>
          <h2 className="text-3xl text-gray-900 mb-6 leading-tight">
            Lab activo. Settlement en pre-launch.
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 pr-4 font-semibold text-gray-900">Endpoint</td>
                <td className="py-3 font-mono text-xs">
                  <code className="bg-gray-100 px-1.5 py-1 rounded">GET /api/agentic/buy?slug=&qty=</code>
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 pr-4 font-semibold text-gray-900">Protocolo</td>
                <td className="py-3">x402 v1</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 pr-4 font-semibold text-gray-900">Asset</td>
                <td className="py-3">USDC on Base mainnet</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 pr-4 font-semibold text-gray-900">Discovery</td>
                <td className="py-3 text-emerald-700">✓ Live · 402 response correcto</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 pr-4 font-semibold text-gray-900">Settlement</td>
                <td className="py-3 text-amber-700">⏳ Pre-launch · contacto requerido</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-gray-900">Documentación</td>
                <td className="py-3">
                  <a
                    href="https://www.x402.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    x402.org
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA contacto */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿Construyendo un agente que compre materiales de arte?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Estamos en early access para integraciones agentic. Si tu agente necesita
            consumir nuestro endpoint con settlement on-chain, escribinos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/contacto"
              className="inline-block bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider transition-colors"
            >
              Solicitar early access →
            </Link>
            <a
              href="https://github.com/coinbase/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-gray-900 px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              Coinbase x402 docs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
