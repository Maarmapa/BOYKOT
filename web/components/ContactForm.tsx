'use client';

export default function ContactForm() {
  return (
    <form
      className="space-y-3"
      onSubmit={e => {
        e.preventDefault();
        alert('Por ahora escribinos directo a providencia@boykot.cl — el formulario se conecta cuando integremos Brevo.');
      }}
    >
      <input name="name" placeholder="Nombre" required
        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <input name="email" type="email" placeholder="Email" required
        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <select name="topic"
        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400">
        <option value="general">Consulta general</option>
        <option value="b2b">Mayorista / B2B</option>
        <option value="stock">Stock de un producto</option>
        <option value="envio">Despacho</option>
        <option value="otro">Otro</option>
      </select>
      <textarea name="message" placeholder="Mensaje" required rows={6}
        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
      <button
        type="submit"
        className="w-full text-white py-2.5 rounded-md font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#0066ff' }}
      >
        Enviar
      </button>
    </form>
  );
}
