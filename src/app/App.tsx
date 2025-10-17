import { getCurrentUser, logout } from '@/services/auth';
import { Info } from "lucide-react";

export default function App() {
  const user = getCurrentUser();

  const roleClass =
    user?.rol === 'coordinador'
      ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30'
      : 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30';

  const initials = (user?.username ?? '?')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-800/30 ring-1 ring-inset ring-indigo-500/30">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-300">
                  <path
                    fill="currentColor"
                    d="M4 6a2 2 0 0 1 2-2h6l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM14 4v4h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Gestor de Expedientes e Indicios
                </h1>
                <p className="hidden sm:block text-xs text-slate-400">
                  Panel de administración
                </p>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              {/* Avatar + data */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-1.5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-slate-200 font-semibold uppercase">
                  {initials}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-white">
                    {user?.username}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${roleClass}`}
                    >
                      {user?.rol ?? '—'}
                    </span>
                    <span className="text-emerald-400">Conectado</span>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  location.href = '/login';
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                title="Cerrar sesión"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6 0h10.5m0 0l-3 3m3-3l-3-3"
                  />
                </svg>
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>

              <a
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium 
                text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Info className="h-4 w-4 text-indigo-400" />
                <span>Acerca de</span>
              </a>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-600/40 to-transparent" />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Expedientes */}
        <div className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-600/20 to-indigo-900/20 p-6 shadow-lg hover:shadow-indigo-700/40 hover:scale-[1.02] transition-all">
          <div className="text-4xl mb-2">📂</div>
          <div className="text-slate-400 text-sm">Expedientes</div>
          <div className="mt-1 text-2xl font-extrabold text-white">Listado</div>
          <a href="/expedientes" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 font-medium text-sm">
            Ir →
          </a>
        </div>

        {/* Indicios */}
        <div className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 p-6 shadow-lg hover:shadow-emerald-700/40 hover:scale-[1.02] transition-all">
          <div className="text-4xl mb-2">🧾</div>
          <div className="text-slate-400 text-sm">Indicios</div>
          <div className="mt-1 text-2xl font-extrabold text-white">Por expediente</div>
          <a href="/indicios" className="mt-3 inline-block text-indigo-400 hover:text-indigo-300 text-sm">
            Gestionar →
          </a>
        </div>

        {/* Usuarios (solo coordinador) */}
        {user?.rol === 'coordinador' && (
          <div className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 shadow-lg hover:shadow-purple-700/40 hover:scale-[1.02] transition-all">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-slate-400 text-sm">Usuarios</div>
            <div className="mt-1 text-2xl font-extrabold text-white">Gestión</div>
            <a href="/usuarios" className="mt-4 inline-block text-purple-400 hover:text-purple-300 font-medium text-sm">
              Administrar →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}



