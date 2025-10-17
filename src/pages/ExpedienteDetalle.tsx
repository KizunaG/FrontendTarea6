import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerExpediente } from '@/services/expedientes';
import type { Expediente } from '@/types/expediente';

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const [exp, setExp] = useState<Expediente | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    obtenerExpediente(Number(id))
      .then(setExp)
      .catch(e => setError(e?.response?.data?.message ?? 'Error al cargar expediente'));
  }, [id]);

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!exp) {
    return <div className="p-6 text-slate-300">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/expedientes"
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          ← Volver
        </Link>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            Expediente #{exp.id}
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-300">Código</dt>
              <dd className="text-white">{exp.codigo}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-300">Estado</dt>
              <dd className="capitalize">{exp.estado}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-300">Descripción</dt>
              <dd className="text-white">{exp.descripcion}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-300">Técnico</dt>
              <dd>{exp.tecnico ?? exp.tecnico_id}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-300">Aprobador</dt>
              <dd>{exp.aprobador ?? '—'}</dd>
            </div>
            {exp.justificacion && (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-300">Justificación</dt>
                <dd className="text-amber-300">{exp.justificacion}</dd>
              </div>
            )}
            {exp.fecha_estado && (
              <div>
                <dt className="font-semibold text-slate-300">Fecha de estado</dt>
                <dd>{new Date(exp.fecha_estado).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
