import api from './api';
import type { LoginRequest, LoginResponse } from '@/types/auth';

// Tipos útiles (no hace falta exportarlos)
type Rol = 'tecnico' | 'coordinador';

function normalizeRol(v: any): Rol | undefined {
  if (Array.isArray(v) && v.length) v = v[0];
  const s = String(v ?? '').toLowerCase().trim();
  if (s === 'coordinador') return 'coordinador';
  if (s === 'tecnico' || s === 'técnico') return 'tecnico';
  return undefined;
}

function decodeJwtPayload(token?: string): Record<string, any> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function extractUserFromPayload(payload: Record<string, any> = {}) {
  const id = Number(
    payload.id ?? payload.userId ?? payload.sub ?? payload.user_id ?? payload.uid ?? 0
  );
  const username =
    payload.username ?? payload.user_name ?? payload.name ?? payload.preferred_username ?? '';
  const rol =
    normalizeRol(payload.rol ?? payload.role ?? payload.roles ?? payload.Role ?? payload['x-role']);
  return { id, username, rol };
}

// ---------- API pública que ya usabas ----------

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data);
  return res.data;
}

/**
 * Guarda token y usuario en localStorage.
 * - Si el backend no envía user.rol, lo intentamos deducir del JWT.
 * - Normaliza el rol a: 'tecnico' | 'coordinador'.
 */
export function saveSession({ token, user }: LoginResponse) {
  const fromJwt = decodeJwtPayload(token) || {};
  const decoded = extractUserFromPayload(fromJwt);

  const merged = {
    id: Number(user?.id ?? decoded.id ?? 0),
    username: String(user?.username ?? decoded.username ?? ''),
    rol:
      normalizeRol((user as any)?.rol ?? (user as any)?.role ?? decoded.rol) ??
      ('tecnico' as Rol), // default seguro para no romper UI
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(merged));
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Devuelve siempre { id, username, rol } ya normalizado.
 * Si hay sesiones viejas, intenta normalizar su rol.
 */
export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as { id: any; username: any; rol?: any; role?: any };
    const rol = normalizeRol(u.rol ?? (u as any).role) ?? 'tecnico';
    return {
      id: Number(u.id ?? 0),
      username: String(u.username ?? ''),
      rol,
    } as { id: number; username: string; rol: Rol };
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
