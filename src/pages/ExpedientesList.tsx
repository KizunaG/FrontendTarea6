import { useEffect, useMemo, useState } from 'react';
import {
  listarExpedientes,
  crearExpediente,
  actualizarExpediente,
  actualizarEstado,
  activarDesactivar,
  type Expediente,
  type Estado,
} from '@/services/expedientes';
import { getCurrentUser } from '@/services/auth';

export default function ExpedientesList() {
  const user = getCurrentUser();
  const soyCoord = user?.rol === 'coordinador';
  const soyTec   = user?.rol === 'tecnico';

  // filtros — mapean 1:1 al SP (estado, codigo, tecnico_id)
  const [estado, setEstado] = useState<Estado | ''>('');
  const [codigo, setCodigo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [rows, setRows] = useState<Expediente[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nuevo, setNuevo] = useState({ codigo: '', descripcion: '' });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // para bloquear UI cuando cambia estado
  const [updatingEstadoId, setUpdatingEstadoId] = useState<number | null>(null);

  // ====== MODAL DE EDICIÓN ======
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editing, setEditing] = useState<Expediente | null>(null);
  const [editForm, setEditForm] = useState({ codigo: '', descripcion: '' });

  // ====== MODAL DE RECHAZO (justificación) ======
  const [justOpen, setJustOpen] = useState(false);
  const [savingJust, setSavingJust] = useState(false);
  const [justExpediente, setJustExpediente] = useState<Expediente | null>(null);
  const [justificacion, setJustificacion] = useState('');

  const tecnicoId = useMemo(() => (user?.rol === 'tecnico' ? user.id : null), [user]);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);

      const resp = await listarExpedientes({
        page,
        pageSize,
        estado: estado || null,
        codigo: codigo || null,
        tecnico_id: tecnicoId,
        activo: null, // (opcional) puedes reintroducir visibilidad si lo necesitas
      });

      setRows(resp.data);
      setTotal(resp.total);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Error al cargar expedientes');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const onBuscar = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setPage(1);
    load();
  };

  // CREAR (solo técnico)
  const onCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!soyTec) {
        throw new Error('No autorizado: solo un técnico puede crear expedientes.');
      }

      const codigoTrim = nuevo.codigo.trim();
      const descTrim = nuevo.descripcion.trim();
      if (!codigoTrim) throw new Error('El código es obligatorio.');
      if (!descTrim) throw new Error('La descripción es obligatoria.');
      if (codigoTrim.length > 50) throw new Error('El código no puede exceder 50 caracteres.');
      if (descTrim.length > 500) throw new Error('La descripción no puede exceder 500 caracteres.');

      setCreating(true);
      await crearExpediente({ codigo: codigoTrim, descripcion: descTrim });

      setNuevo({ codigo: '', descripcion: '' });
      setPage(1);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Error al crear expediente');
    } finally {
      setCreating(false);
    }
  };

  // APROBAR directo (botón)
  const aprobar = async (id: number) => {
    try {
      if (!soyCoord) return;
      setError(null);
      setUpdatingEstadoId(id);
      await actualizarEstado(id, { estado: 'aprobado' });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo aprobar el expediente');
    } finally {
      setUpdatingEstadoId(null);
    }
  };

  // RECHAZAR → abre modal de justificación
  const abrirRechazo = (x: Expediente) => {
    if (!soyCoord) return;
    if (!Number(x.activo)) {
      setError('No se puede rechazar: el expediente está inactivo.');
      return;
    }
    setJustExpediente(x);
    setJustificacion('');
    setJustOpen(true);
  };

  // Confirmar rechazo desde modal
  const confirmarRechazo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justExpediente) return;

    try {
      setError(null);
      setSavingJust(true);

      if (justificacion.trim().length === 0) {
        throw new Error('Se requiere justificación para rechazo.');
      }

      await actualizarEstado(justExpediente.id, { estado: 'rechazado', justificacion: justificacion.trim() });
      setJustOpen(false);
      setJustExpediente(null);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo rechazar el expediente');
    } finally {
      setSavingJust(false);
    }
  };

  // ACTIVAR / DESACTIVAR
  const toggleActivo = async (x: Expediente) => {
    try {
      setError(null);
      const nuevoValor = Number(x.activo) ? 0 : 1;
      await activarDesactivar(x.id, nuevoValor as 0 | 1);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo cambiar el estado de activo');
    }
  };

  // ====== EDITAR (abre modal) ======
  const abrirEditar = (x: Expediente) => {
    if (!Number(x.activo)) {
      setError('No se puede actualizar: el expediente está inactivo. Actívalo primero.');
      return;
    }
    setEditing(x);
    setEditForm({
      codigo: x.codigo ?? '',
      descripcion: x.descripcion ?? '',
    });
    setEditOpen(true);
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      setError(null);
      setSavingEdit(true);

      const codigoNuevo = editForm.codigo.trim();
      const descNueva = editForm.descripcion.trim();
      if (!codigoNuevo) throw new Error('El código es obligatorio.');
      if (!descNueva) throw new Error('La descripción es obligatoria.');
      if (codigoNuevo.length > 50) throw new Error('El código no puede exceder 50 caracteres.');
      if (descNueva.length > 500) throw new Error('La descripción no puede exceder 500 caracteres.');

      await actualizarExpediente(editing.id, { codigo: codigoNuevo, descripcion: descNueva });
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo actualizar el expediente');
    } finally {
      setSavingEdit(false);
    }
  };

  // (opcional) función genérica para cambiar estado desde otros lugares
  const cambiarEstado = async (x: Expediente, nuevo: 'aprobado') => {
    try {
      setError(null);
      if (!Number(x.activo)) throw new Error('No se puede cambiar el estado: el expediente está inactivo.');
      setUpdatingEstadoId(x.id);
      await actualizarEstado(x.id, { estado: nuevo });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo cambiar el estado');
    } finally {
      setUpdatingEstadoId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Expedientes</h2>
          <a href="/" className="text-sm text-slate-300 hover:text-white">← Volver</a>
        </div>

        {/* Filtros → @estado, @codigo, @tecnico_id */}
        <form onSubmit={onBuscar} className="mt-4 grid gap-2 sm:grid-cols-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div className="sm:col-span-1">
            <label className="block text-sm text-slate-300 mb-1">Estado</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value as Estado | '')}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
            >
              <option value="">(Todos)</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm text-slate-300 mb-1">Código</label>
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder="Buscar por código (LIKE)"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">
              Buscar
            </button>
          </div>

          {tecnicoId && (
            <div className="sm:col-span-4 text-xs text-slate-400">
              * Mostrando solo tus expedientes (tecnico_id = {tecnicoId})
            </div>
          )}
        </form>

        {error && (
          <div className="mt-3 rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Crear (solo TÉCNICO) */}
        {soyTec && (
          <form onSubmit={onCrear} className="mt-4 grid gap-2 sm:grid-cols-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <input
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              placeholder="Código"
              value={nuevo.codigo}
              onChange={e => setNuevo(s => ({ ...s, codigo: e.target.value }))}
              maxLength={50}
              required
            />
            <input
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 sm:col-span-2"
              placeholder="Descripción"
              value={nuevo.descripcion}
              onChange={e => setNuevo(s => ({ ...s, descripcion: e.target.value }))}
              maxLength={500}
              required
            />
            <div className="sm:col-span-3">
              <button
                disabled={creating}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-60"
              >
                {creating ? 'Creando…' : 'Crear expediente'}
              </button>
            </div>
          </form>
        )}

        {/* Tabla */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-slate-300">
                <th>ID</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Técnico</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">Sin resultados</td></tr>
              ) : rows.map(x => (
                <tr key={x.id} className="odd:bg-slate-900/40 even:bg-slate-900/20">
                  <td className="px-3 py-2">{x.id}</td>
                  <td className="px-3 py-2 font-semibold">{x.codigo}</td>
                  <td className="px-3 py-2">{x.descripcion}</td>
                  <td className="px-3 py-2">
                    <span className="capitalize">{x.estado}</span>
                    {soyCoord && Number(x.activo) === 1 && (
                      <span className="ml-2 inline-flex gap-1">
                        <button
                          onClick={() => aprobar(x.id)}
                          disabled={updatingEstadoId === x.id}
                          className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] hover:bg-emerald-500 disabled:opacity-50"
                          title="Marcar como aprobado"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => abrirRechazo(x)}
                          disabled={updatingEstadoId === x.id}
                          className="rounded bg-amber-600 px-2 py-0.5 text-[10px] hover:bg-amber-500 disabled:opacity-50"
                          title="Marcar como rechazado (requiere justificación)"
                        >
                          Rechazar
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">{x.tecnico ?? x.tecnico_id}</td>
                  <td className="px-3 py-2">{Number(x.activo) ? 'Sí' : 'No'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <a
                      href={`/expedientes/${x.id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                    >
                      Ver detalle
                    </a>
                    <button
                      onClick={() => abrirEditar(x)}
                      disabled={!Number(x.activo)}
                      title={Number(x.activo) ? 'Editar expediente' : 'Activa el expediente para poder editar'}
                      className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => toggleActivo(x)}
                      className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                    >
                      {Number(x.activo) ? 'Desactivar' : 'Activar'}
                    </button>

                    <a href={`/expedientes/${x.id}/indicios`} className="text-indigo-400 hover:text-indigo-300 text-xs underline">Indicios</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>Página {page} de {totalPages} • {total} resultados</span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* ===== Modal de edición de expediente ===== */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-lg font-semibold">Editar expediente #{editing?.id}</h3>
              <button
                className="text-slate-300 hover:text-white"
                onClick={() => { if (!savingEdit) { setEditOpen(false); setEditing(null); } }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarEdicion} className="p-4 grid gap-3 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Código *</label>
                <input
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                  value={editForm.codigo}
                  onChange={e => setEditForm(s => ({ ...s, codigo: e.target.value }))}
                  maxLength={50}
                  required
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-sm text-slate-300 mb-1">Descripción *</label>
                <input
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                  value={editForm.descripcion}
                  onChange={e => setEditForm(s => ({ ...s, descripcion: e.target.value }))}
                  maxLength={500}
                  required
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

      {/* ===== Modal de justificación de rechazo ===== */}
      {justOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="text-lg font-semibold">Rechazar expediente #{justExpediente?.id}</h3>
              <button
                className="text-slate-300 hover:text-white"
                onClick={() => { if (!savingJust) { setJustOpen(false); setJustExpediente(null); } }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={confirmarRechazo} className="p-4 grid gap-3">
              <label className="block text-sm text-slate-300 mb-1">Justificación *</label>
              <textarea
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                rows={4}
                value={justificacion}
                onChange={e => setJustificacion(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => { if (!savingJust) { setJustOpen(false); setJustExpediente(null); } }}
                  className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingJust}
                  className="rounded-lg bg-amber-600 px-4 py-2 font-semibold hover:bg-amber-500 disabled:opacity-60"
                >
                  {savingJust ? 'Rechazando…' : 'Confirmar rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





