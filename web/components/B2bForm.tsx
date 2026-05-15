'use client';

export default function B2bForm() {
  return (
    <form
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      onSubmit={e => {
        e.preventDefault();
        alert('El portal B2B está en construcción. Mientras tanto, escribinos a providencia@boykot.cl con el asunto B2B y tus datos.');
      }}
    >
      <input type="text" name="company" placeholder="Razón social" required
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <input type="text" name="rut" placeholder="RUT empresa" required
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <input type="text" name="giro" placeholder="Giro / actividad económica"
        className="sm:col-span-2 border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <input type="email" name="email" placeholder="Email" required
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <input type="tel" name="phone" placeholder="Teléfono" required
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <textarea name="notes" placeholder="Volumen estimado / qué productos te interesan"
        className="sm:col-span-2 border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400 min-h-[90px]" />
      <button type="submit"
        className="sm:col-span-2 mt-2 text-white py-2.5 rounded-md font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#0066ff' }}>
        Solicitar acceso
      </button>
    </form>
  );
}
