'use client';

import { useEffect, useState } from 'react';

export interface AppliedDiscount {
  type: 'referral' | 'promo';
  code: string;
  discount_clp: number;
  referrer_email?: string; // solo si type=referral
}

export interface AppliedCredits {
  amount_clp: number;
  balance_clp: number;
}

interface Props {
  email: string;
  subtotalClp: number;
  onChange: (state: { discount: AppliedDiscount | null; credits: AppliedCredits | null }) => void;
}

export default function CheckoutDiscounts({ email, subtotalClp, onChange }: Props) {
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const [creditsTier, setCreditsTier] = useState<string | null>(null);
  const [applyCredits, setApplyCredits] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState(0);

  // Load credits balance cuando email cambia + es valido
  useEffect(() => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setCreditsBalance(null);
      return;
    }
    fetch(`/api/credits/balance?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.balance_clp != null) {
          setCreditsBalance(data.balance_clp);
          setCreditsTier(data.tier || null);
        }
      })
      .catch(() => {});
  }, [email]);

  // Propagar cambios al parent
  useEffect(() => {
    const credits = applyCredits && creditsAmount > 0
      ? { amount_clp: creditsAmount, balance_clp: creditsBalance || 0 }
      : null;
    onChange({ discount, credits });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount, applyCredits, creditsAmount, creditsBalance]);

  async function validateCode() {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setValidating(true);
    setDiscountError(null);

    // Try referral first
    try {
      const refRes = await fetch('/api/referrals/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: clean, email, subtotal_clp: subtotalClp }),
      });
      const refData = await refRes.json();
      if (refData.valid) {
        setDiscount({
          type: 'referral',
          code: clean,
          discount_clp: refData.discount_clp,
          referrer_email: refData.referrer_email,
        });
        setValidating(false);
        return;
      }

      // Try promo
      const promoRes = await fetch('/api/checkout/apply-promo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal_clp: subtotalClp, email }),
      });
      const promoData = await promoRes.json();
      if (promoData.valid) {
        setDiscount({
          type: 'promo',
          code: clean,
          discount_clp: promoData.discount_clp || 0,
        });
        setValidating(false);
        return;
      }

      setDiscountError(promoData.message || refData.message || 'Código no válido');
    } catch (e) {
      setDiscountError((e as Error).message);
    } finally {
      setValidating(false);
    }
  }

  function removeDiscount() {
    setDiscount(null);
    setCode('');
    setDiscountError(null);
  }

  const subtotalAfterDiscount = Math.max(0, subtotalClp - (discount?.discount_clp || 0));
  const maxCredits = Math.min(creditsBalance || 0, subtotalAfterDiscount);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Promo / Referral code */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          ¿Tenés un código promo o de referido?
        </label>
        {discount ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded p-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-900">{discount.code}</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                  {discount.type === 'referral' ? 'Referido' : 'Promo'}
                </span>
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                −${discount.discount_clp.toLocaleString('es-CL')} aplicado
              </div>
            </div>
            <button
              type="button"
              onClick={removeDiscount}
              className="text-xs text-emerald-700 hover:text-emerald-900 underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="EJ: AMIGO10"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono uppercase"
            />
            <button
              type="button"
              onClick={validateCode}
              disabled={!code.trim() || validating || !email}
              className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {validating ? '…' : 'Aplicar'}
            </button>
          </div>
        )}
        {!email && !discount && (
          <p className="text-xs text-gray-500 mt-1">Llená tu email primero arriba.</p>
        )}
        {discountError && (
          <p className="text-xs text-red-600 mt-1">{discountError}</p>
        )}
      </div>

      {/* Boykot Credits */}
      {creditsBalance != null && creditsBalance > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💰</span>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Boykot Credits {creditsTier ? `· tier ${creditsTier}` : ''}
              </div>
              <div className="text-sm font-bold text-gray-900">
                ${creditsBalance.toLocaleString('es-CL')} disponibles
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={applyCredits}
              onChange={e => {
                setApplyCredits(e.target.checked);
                if (e.target.checked) setCreditsAmount(maxCredits);
              }}
              className="rounded"
            />
            <span>Usar ${maxCredits.toLocaleString('es-CL')} en esta compra</span>
          </label>
          {applyCredits && maxCredits > 0 && (
            <input
              type="range"
              min="0"
              max={maxCredits}
              step="500"
              value={creditsAmount}
              onChange={e => setCreditsAmount(parseInt(e.target.value, 10))}
              className="w-full mt-2"
            />
          )}
          {applyCredits && creditsAmount > 0 && (
            <div className="text-xs text-amber-700 mt-1">
              Usar <strong>${creditsAmount.toLocaleString('es-CL')}</strong> de saldo · te quedarían
              ${(creditsBalance - creditsAmount).toLocaleString('es-CL')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
