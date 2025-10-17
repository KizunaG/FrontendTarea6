import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  listarIndicios,
  crearIndicio,
  actualizarIndicio,
  activarDesactivarIndicio,
} from '@/services/indicios';
import { obtenerExpediente } from '@/services/expedientes';
import { getCurrentUser } from '@/services/auth';
import type { Indicio } from '@/types/indicios';

export default function IndiciosPage() {
  const params = useParams();
  const expedienteId = Number(params.id);

  // Solo técnico puede crear
  const user = getCurrentUser();
  const esTecnico = user?.rol === 'tecnico';

  const [rows, setRows] = useState<Indicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resumen del expediente validado (para mostrar código/estado en el encabezado)
  const [expResumen, setExpResumen] = useState<{
    id: number;
    codigo: string;
    estado: string;
    activo: 0 | 1 | boolean;
  } | null>(null);

  // ----- crear (solo técnico) -----
  const [form, setForm] = useState({
    descripcion: '',
    color: '',
    tamano: '',
    peso: '' as any,
    ubicacion: '',
  });
  const [creating, setCreating] = useState(false);

  // ----- edición (modal) -----
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editing, setEditing] = useState<Indicio | null>(null);
  const [editForm, setEditForm] = useState({
    descripcion: '',
    color: '',
    tamano: '',
    peso: '' as any,
    ubicacion: '',
  });

  const load = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1) Validación básica del id
      if (!expedienteId || Number.isNaN(expedienteId) || expedienteId <= 0) {
        throw new Error('Identificador de expediente inválido.');
      }

      // 2) Verificar que el expediente exista (y esté activo)
      const exp = await obtenerExpediente(expedienteId).catch((e: any) => {
        const msg =
          e?.response?.status === 404
            ? 'El expediente no existe.'
            : e?.response?.status === 403
              ? 'No tienes permiso para ver este expediente.'
              : e?.response?.data?.message ?? 'No se pudo obtener el expediente.';
        throw new Error(msg);
      });

      if (!exp || Number(exp.activo) !== 1) {
        throw new Error('El expediente no existe o está inactivo.');
      }

      setExpResumen({
        id: exp.id,
        codigo: exp.codigo,
        estado: exp.estado,
        activo: exp.activo,
      });

      // 3) Si existe, cargar indicios
      const data = await listarIndicios(expedienteId);
      setRows(data);
    } catch (e: any) {
      setRows([]);
      setExpResumen(null);
      setError(e?.message ?? 'Error al cargar indicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!expedienteId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  // ----- crear (solo técnico) -----
  const onCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!esTecnico) throw new Error('No autorizado para crear indicios.');
      if (!expResumen) throw new Error('No se puede crear: el expediente no es válido.');

      const descripcion = form.descripcion.trim();
      if (!descripcion) throw new Error('La descripción es obligatoria.');

      const payload = {
        descripcion,
        color: form.color.trim() || undefined,
        tamano: form.tamano.trim() || undefined,
        ubicacion: form.ubicacion.trim() || undefined,
        peso:
          form.peso === '' || form.peso === null || form.peso === undefined
            ? undefined
            : Math.max(0, Number(form.peso)),
      };

      setCreating(true);
      await crearIndicio(expedienteId, payload);
      setForm({ descripcion: '', color: '', tamano: '', peso: '', ubicacion: '' });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo crear el indicio');
    } finally {
      setCreating(false);
    }
  };

  // ----- editar (modal) -----
  const editar = (x: Indicio) => {
    setEditing(x);
    setEditForm({
      descripcion: x.descripcion ?? '',
      color: x.color ?? '',
      tamano: x.tamano ?? '',
      peso: (x.peso ?? '') as any,
      ubicacion: x.ubicacion ?? '',
    });
    setEditOpen(true);
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      setError(null);
      setSavingEdit(true);

      const descripcion = editForm.descripcion.trim();
      if (!descripcion) throw new Error('La descripción es obligatoria.');

      const payload = {
        descripcion,
        color: editForm.color.trim() || undefined,
        tamano: editForm.tamano.trim() || undefined,
        ubicacion: editForm.ubicacion.trim() || undefined,
        peso:
          editForm.peso === '' || editForm.peso === null || editForm.peso === undefined
            ? undefined
            : Math.max(0, Number(editForm.peso)),
      };

      await actualizarIndicio(editing.id, payload);
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo actualizar el indicio');
    } finally {
      setSavingEdit(false);
    }
  };

  // ----- activar/desactivar -----
  const toggleActivo = async (x: Indicio) => {
    try {
      setError(null);
      const nuevo = Number(x.activo) ? 0 : 1;
      await activarDesactivarIndicio(x.id, nuevo as 0 | 1);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo cambiar activo');
    }
  };

  // ----- UI -----
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {expResumen
              ? <>Indicios del expediente #{expResumen.id} <span className="text-slate-400">({expResumen.codigo} • <span className="capitalize">{expResumen.estado}</span>)</span></>
              : <>Indicios del expediente #{isNaN(expedienteId) ? '—' : expedienteId}</>}
          </h2>
          <Link to="/expedientes" className="text-sm text-slate-300 hover:text-white">← Volver</Link>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Si no hay expediente válido, no mostramos formulario/tabla */}
        {!expResumen ? (
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-slate-300">
            Verifica el identificador del expediente y tus permisos.
          </div>
        ) : (
          <>
            {/* ===== Formulario de creación (solo TÉCNICO) ===== */}
            {esTecnico && (
              <form
                onSubmit={onCrear}
                className="mt-4 grid gap-3 sm:grid-cols-6 bg-slate-900/40 p-4 rounded-xl border border-slate-800"
              >
                <div className="sm:col-span-3">
                  <label className="block text-sm text-slate-300 mb-1">Descripción *</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={form.descripcion}
                    onChange={e => setForm(s => ({ ...s, descripcion: e.target.value }))}
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-300 mb-1">Color</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={form.color}
                    onChange={e => setForm(s => ({ ...s, color: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-300 mb-1">Tamaño</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={form.tamano}
                    onChange={e => setForm(s => ({ ...s, tamano: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-300 mb-1">Peso (≥ 0)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={form.peso}
                    onChange={e => setForm(s => ({ ...s, peso: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-slate-300 mb-1">Ubicación</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={form.ubicacion}
                    onChange={e => setForm(s => ({ ...s, ubicacion: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-6">
                  <button
                    disabled={creating}
                    className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {creating ? 'Creando…' : 'Crear indicio'}
                  </button>
                </div>
              </form>
            )}
            {/* ===== /Formulario de creación ===== */}

            {/* Tabla */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/60">
                  <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-slate-300">
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Color</th>
                    <th>Tamaño</th>
                    <th>Peso</th>
                    <th>Ubicación</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">Cargando…</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-400">Sin resultados</td></tr>
                  ) : rows.map(x => (
                    <tr key={x.id} className="odd:bg-slate-900/40 even:bg-slate-900/20">
                      <td className="px-3 py-2">{x.id}</td>
                      <td className="px-3 py-2">{x.descripcion}</td>
                      <td className="px-3 py-2">{x.color ?? '—'}</td>
                      <td className="px-3 py-2">{x.tamano ?? '—'}</td>
                      <td className="px-3 py-2">{x.peso ?? '—'}</td>
                      <td className="px-3 py-2">{x.ubicacion ?? '—'}</td>
                      <td className="px-3 py-2">{Number(x.activo) ? 'Sí' : 'No'}</td>
                      <td className="px-3 py-2 space-x-2">
                        <button
                          onClick={() => editar(x)}
                          className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActivo(x)}
                          className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                        >
                          {Number(x.activo) ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal de edición */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <h3 className="text-lg font-semibold">Editar indicio #{editing?.id}</h3>
                <button
                  className="text-slate-300 hover:text-white"
                  onClick={() => { if (!savingEdit) { setEditOpen(false); setEditing(null); } }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={guardarEdicion} className="p-4 grid gap-3 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm text-slate-300 mb-1">Descripción *</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={editForm.descripcion}
                    onChange={e => setEditForm(s => ({ ...s, descripcion: e.target.value }))}
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-300 mb-1">Color</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={editForm.color}
                    onChange={e => setEditForm(s => ({ ...s, color: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-300 mb-1">Tamaño</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={editForm.tamano}
                    onChange={e => setEditForm(s => ({ ...s, tamano: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-300 mb-1">Peso (≥ 0)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={editForm.peso}
                    onChange={e => setEditForm(s => ({ ...s, peso: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm text-slate-300 mb-1">Ubicación</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                    value={editForm.ubicacion}
                    onChange={e => setEditForm(s => ({ ...s, ubicacion: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-6 flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => { if (!savingEdit) { setEditOpen(false); setEditing(null); } }}
                    className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {savingEdit ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
