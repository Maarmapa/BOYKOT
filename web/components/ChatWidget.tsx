'use client';

import { useState, useRef, useEffect } from 'react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL: Msg = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de Boykot. ¿En qué te puedo ayudar? Por ejemplo: "qué marcador me sirve para anime", o "cómo pinto unas zapatillas".',
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([INITIAL]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs = [...msgs, { role: 'user' as const, content: text }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      setMsgs([...newMsgs, { role: 'assistant', content: data.reply || '…' }]);
    } catch {
      setMsgs([...newMsgs, {
        role: 'assistant',
        content: 'No te pude responder. Escribime por WhatsApp: https://wa.me/56223350961',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Abrir chat"
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
        style={{ backgroundColor: '#0066ff' }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[70vh] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#0066ff' }}>
            <div className="text-white">
              <div className="font-semibold text-sm">Asistente Boykot</div>
              <div className="text-xs opacity-80">Respondemos al toque</div>
            </div>
            <a
              href="https://wa.me/56223350961"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/90 hover:text-white underline underline-offset-2"
            >
              WhatsApp ↗
            </a>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500">
                  Pensando…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={send} className="border-t border-gray-100 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribí tu pregunta…"
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 outline-none focus:border-gray-700"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#0066ff' }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
