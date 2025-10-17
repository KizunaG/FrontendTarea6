// src/services/usuarios.ts
import api from './api';
import type { ListarUsuariosResp, Rol } from '@/types/usuarios';

/**
 * GET /usuarios?search=&page=&size=
 * El backend devuelve { total, page, size, data_json }
 * Aquí lo normalizamos a { total, page, size, data } donde data es un array.
 */
export async function listarUsuarios(params: {
  pagina: number;          // 1-based
  tamano: number;          // tamaño de página
  buscar?: string | null;  // nombre/usuario/rol
}) {
  const res = await api.get<ListarUsuariosResp>('/usuarios', {
    params: {
      // 👇 mapeo a los nombres que espera tu API/Stored Procedure
      page: params.pagina,
      size: params.tamano,
      search: params.buscar ?? undefined,
    },
  });

  const payload = res.data as any;
  const { total, page, size } = payload;

  // El SP devuelve "data_json" (string con JSON). Lo convertimos en array.
  const data =
    Array.isArray(payload.data) ? payload.data
    : payload.data_json ? JSON.parse(payload.data_json)
    : [];

  return { total, page, size, data };
}

/**
 * POST /usuarios  { username, password, role }
 */
export async function crearUsuario(payload: {
  username: string;
  password: string;
  role: Rol;
}) {
  const res = await api.post('/usuarios', payload);
  return res.data;
}
