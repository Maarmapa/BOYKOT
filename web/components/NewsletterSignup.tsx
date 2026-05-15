'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <h4 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">
        Newsletter
      </h4>
      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
        Nuevos colores, restock y eventos. Sin spam, sin compromisos.
      </p>
      {submitted ? (
        <p className="text-sm text-green-700">¡Gracias! Te avisamos cuando haya algo bueno.</p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email) return;
            try {
              // Brevo endpoint comes online when BREVO_API_KEY lands in Vercel.
              // For now, just save to local state and acknowledge.
              await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email, source: 'footer' }),
              }).catch(() => null);
              setSubmitted(true);
            } catch {
              setSubmitted(true);
            }
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu email"
            required
            className="flex-1 min-w-0 border border-gray-200 bg-white rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            className="text-white px-3 py-2 rounded-md text-sm font-medium hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: '#0066ff' }}
          >
            Suscribirme
          </button>
        </form>
      )}
    </div>
  );
}
