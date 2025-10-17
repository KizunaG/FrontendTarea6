import api from './api';

export type Estado = 'pendiente' | 'aprobado' | 'rechazado';

export interface Expediente {
  id: number;
  codigo: string;
  descripcion: string;
  estado: Estado;
  activo: 0 | 1 | boolean; // el SP filtra activo=1, pero lo dejamos flexible
  tecnico_id: number;
  tecnico?: string;        // viene del SP: u.username AS tecnico
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  estado?: Estado | null;
  codigo?: string | null;      // búsqueda parcial (LIKE)
  tecnico_id?: number | null;  // filtro por técnico
  activo?: 0|1|null;
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * El backend debe exponer GET /expedientes con query:
 * ?page=&pageSize=&estado=&codigo=&tecnico_id=
 * y mapear los 2 resultsets del SP a { data, total, page, pageSize }.
 * Aun así, aquí dejo normalizadores por si todavía no lo hace.
 */
export async function listarExpedientes(params: ListParams): Promise<Page<Expediente>> {
  const qp = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    estado: params.estado ?? null,
    codigo: params.codigo ?? null,
    tecnico_id: params.tecnico_id ?? null,
  };

  const res = await api.get('/expedientes', { params: qp });
  const payload = res.data;

  // Caso ideal: el backend ya mapeó { data, total, page, pageSize }
  if (payload && Array.isArray(payload.data) && typeof payload.total === 'number') {
    return {
      data: payload.data as Expediente[],
      total: payload.total as number,
      page: payload.page ?? qp.page,
      pageSize: payload.pageSize ?? qp.pageSize,
    };
  }

  // Fallback 1: { rows: [...], total: N }
  if (Array.isArray(payload?.rows) && typeof payload?.total === 'number') {
    return {
      data: payload.rows as Expediente[],
      total: payload.total,
      page: qp.page,
      pageSize: qp.pageSize,
    };
  }

  // Fallback 2: dos resultsets serializados como { recordsets: [rows, [{ total: N }]] }
  if (Array.isArray(payload?.recordsets)) {
    const rows = (payload.recordsets[0] ?? []) as Expediente[];
    const total = Number(payload.recordsets[1]?.[0]?.total ?? rows.length);
    return { data: rows, total, page: qp.page, pageSize: qp.pageSize };
  }

  // Fallback 3: array directo (sin total) → asumimos total = length
  if (Array.isArray(payload)) {
    return { data: payload as Expediente[], total: payload.length, page: qp.page, pageSize: qp.pageSize };
  }

  // Último recurso: intenta algunas claves comunes
  const dataGuess = payload?.result ?? payload?.items ?? payload?.[0] ?? [];
  const totalGuess = Number(payload?.[1]?.total ?? dataGuess.length ?? 0);
  return {
    data: dataGuess as Expediente[],
    total: isNaN(totalGuess) ? 0 : totalGuess,
    page: qp.page,
    pageSize: qp.pageSize,
  };
}

export async function crearExpediente(payload: { codigo: string; descripcion: string }) {
  // el tecnico_id lo toma el backend desde el token (rol técnico)
  const res = await api.post<Expediente>('/expedientes', payload);
  return res.data;
}

export async function actualizarEstado(
  id: number,
  body: { estado: 'aprobado' | 'rechazado'; justificacion?: string }
) {
  const res = await api.patch<Expediente>(`/expedientes/${id}/estado`, body);
  return res.data;
}

export async function activarDesactivar(id: number, activo: 0 | 1) {
  const res = await api.patch<Expediente>(`/expedientes/${id}/activo`, { activo });
  return res.data;
}
export async function actualizarExpediente(
  id: number,
  payload: { codigo: string; descripcion: string }
) {
  const res = await api.put(`/expedientes/${id}`, payload);
  return res.data as Expediente;
}

export async function obtenerExpediente(id: number) {
  const res = await api.get<Expediente>(`/expedientes/${id}`);
  return res.data;
}