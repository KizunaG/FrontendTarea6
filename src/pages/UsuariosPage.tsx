import { useEffect, useMemo, useState } from 'react';
import { listarUsuarios, crearUsuario } from '@/services/usuarios';
import type { Usuario, Rol } from '@/types/usuarios';
import { getCurrentUser } from '@/services/auth';
import { Link } from 'react-router-dom';

export default function UsuariosPage() {
  const current = getCurrentUser();
  const esCoord = useMemo(() => current?.rol === 'coordinador', [current]);

  // filtros/paginación según backend (pagina/tamano/buscar)
  const [pagina, setPagina] = useState(1);
  const [tamano] = useState(10);
  const [buscar, setBuscar] = useState('');

  const [rows, setRows] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // errores y feedback
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // crear
  const [nuevo, setNuevo] = useState({ username: '', password: '', role: 'tecnico' as Rol });

  const totalPages = Math.max(1, Math.ceil(total / tamano));

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await listarUsuarios({ pagina, tamano, buscar: buscar || null });
      setRows(res.data);
      setTotal(res.total);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Error al cargar usuarios';
      setRows([]);
      setTotal(0);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, tamano]);

  const onBuscar = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setPagina(1);
    load();
  };

  const onCrear = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones rápidas de UI
    const u = nuevo.username.trim();
    const p = nuevo.password.trim();
    const r = nuevo.role;

    if (!u) return setError('Debes ingresar un username.');
    if (!p) return setError('Debes ingresar una contraseña.');
    if (p.length < 4) return setError('La contraseña debe tener al menos 4 caracteres.');

    try {
      setError(null);
      setCreating(true);

      await crearUsuario({ username: u, password: p, role: r });

      setNuevo({ username: '', password: '', role: 'tecnico' });
      setPagina(1); // vuelve a la primera página para ver el nuevo
      await load();
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg: string | undefined = err?.response?.data?.message;

      // Normalizamos mensajes basados en tu Swagger:
      // 201: Usuario creado
      // 400: Datos inválidos o username repetido
      // 401: No autenticado
      // 403: Requiere rol coordinador
      // 500: Error del servidor
      let msg: string;
      switch (status) {
        case 400:
          // si el backend manda uno específico (e.g. "username ya existe"), lo usamos
          msg = backendMsg || 'Datos inválidos o el username ya está en uso.';
          break;
        case 401:
          msg = 'No estás autenticado. Inicia sesión nuevamente.';
          break;
        case 403:
          msg = 'Acción no permitida: se requiere rol coordinador.';
          break;
        case 500:
          msg = 'El usuario ya existe.';
          break;
        default:
          msg = backendMsg || err?.message || 'No se pudo crear el usuario.';
      }

      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Usuarios</h2>
          <div className="space-x-4 text-sm">
            <Link to="/expedientes" className="text-slate-300 hover:text-white">Ir a expedientes</Link>
            <a href="/" className="text-slate-300 hover:text-white">← Volver</a>
          </div>
        </div>

        {/* Buscar */}
        <form onSubmit={onBuscar} className="mt-4 grid gap-2 sm:grid-cols-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
          <div className="sm:col-span-3">
            <label className="block text-sm text-slate-300 mb-1">Buscar (nombre/usuario/rol)</label>
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="e.g. tecnico, coordinador, juan"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
            />
          </div>
          <div className="sm:col-span-1 flex items-end">
            <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">
              Buscar
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-3 rounded-lg border border-red-800 bg-red-900/30 px-3 py-2 text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Crear (solo coordinador) */}
        {esCoord && (
          <form onSubmit={onCrear} className="mt-4 grid gap-3 sm:grid-cols-6 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Username *</label>
              <input
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                value={nuevo.username}
                onChange={e => setNuevo(s => ({ ...s, username: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Contraseña *</label>
              <input
                type="password"
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                value={nuevo.password}
                onChange={e => setNuevo(s => ({ ...s, password: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-300 mb-1">Rol *</label>
              <select
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
                value={nuevo.role}
                onChange={e => setNuevo(s => ({ ...s, role: e.target.value as Rol }))}
              >
                <option value="tecnico">técnico</option>
                <option value="coordinador">coordinador</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <button
                disabled={creating}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-60"
              >
                {creating ? 'Creando…' : 'Crear usuario'}
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
                <th>Username</th>
                <th>Rol</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">Cargando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">Sin resultados</td></tr>
              ) : rows.map(u => (
                <tr key={u.id} className="odd:bg-slate-900/40 even:bg-slate-900/20">
                  <td className="px-3 py-2">{u.id}</td>
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2 capitalize">{u.role}</td>
                  <td className="px-3 py-2">{Number(u.activo) ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>Página {pagina} de {totalPages} • {total} resultados</span>
          <div className="space-x-2">
            <button
              disabled={pagina <= 1}
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={pagina >= totalPages}
              onClick={() => setPagina(p => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
