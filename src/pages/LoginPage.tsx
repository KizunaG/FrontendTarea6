import { useState } from 'react';
import { z } from 'zod';
import { login, saveSession } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  username: z.string().min(3, 'El usuario es obligatorio'),
  password: z.string().min(4, 'La contraseña debe tener mínimo 4 caracteres'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      const res = await login(form);
      saveSession(res);
      navigate('/Splash', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Error de autenticación';
      setApiError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-900 to-gray-900 p-4">
      <form onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-extrabold text-white text-center">Iniciar sesión</h1>
        <p className="text-sm text-slate-400 text-center mt-1 mb-5">Ingresa tu usuario y contraseña</p>

        <label className="block text-slate-300 text-sm mb-1">Nombre de usuario</label>
        <input
          name="username"
          type="text"
          placeholder="coordinador1"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          className="w-full rounded-xl border border-slate-600 bg-slate-800 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.username && <span className="text-red-300 text-xs mt-1 block">{errors.username}</span>}

        <label className="block text-slate-300 text-sm mt-3 mb-1">Contraseña</label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-600 bg-slate-800 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.password && <span className="text-red-300 text-xs mt-1 block">{errors.password}</span>}

        {apiError && <div className="mt-3 rounded-lg border border-red-600 bg-red-900/40 text-red-200 text-sm px-3 py-2">
          {apiError}
        </div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 rounded-xl bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-60">
          {loading ? 'Iniciando Sesión…' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
