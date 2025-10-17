import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function IndiciosHub() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [id, setId] = useState('');

  // Si viene ?expediente=ID en la URL, redirige automático
  useEffect(() => {
    const q = sp.get('expediente');
    const n = q ? Number(q) : NaN;
    if (!Number.isNaN(n) && n > 0) navigate(`/expedientes/${n}`, { replace: true });
  }, [sp, navigate]);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(id.trim());
    if (!Number.isNaN(n) && n > 0) navigate(`/expedientes/${n}/indicios`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm">← Volver</Link>
        </div>

        <h2 className="text-2xl font-bold">Indicios por expediente</h2>
        <p className="text-slate-400 mt-1">Ingresa el <span className="text-slate-200 font-medium">ID</span> del expediente.</p>

        <form onSubmit={go} className="mt-5 grid gap-3 sm:grid-cols-5 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div className="sm:col-span-3">
            <label className="block text-sm text-slate-300 mb-1">ID de expediente</label>
            <input
              inputMode="numeric"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="Ej. 1003"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              required
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">
              Abrir indicios
            </button>
          </div>

          <div className="sm:col-span-5 text-xs text-slate-400">
            Tip: también puedes entrar desde el listado de expedientes con <code className="text-slate-300">/indicios?expediente=12</code>.
          </div>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          ¿No recuerdas el ID? Ve al{' '}
          <Link to="/expedientes" className="text-indigo-400 hover:text-indigo-300 underline">listado</Link>{' '}
          y cópialo de ahí.
        </div>
      </div>
    </div>
  );
}
