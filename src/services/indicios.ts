import api from './api';
import type { CrearIndicioDTO, Indicio } from '@/types/indicios';

export async function listarIndicios(expedienteId: number): Promise<Indicio[]> {
  const { data } = await api.get<Indicio[]>(`/expedientes/${expedienteId}/indicios`);
  return data;
}

export async function crearIndicio(
  expedienteId: number,
  payload: CrearIndicioDTO
): Promise<Indicio> {
  // Swagger indica POST /expedientes/{id}/indicios con 201
  const { data } = await api.post<Indicio>(`/expedientes/${expedienteId}/indicios`, payload);
  return data;
}

export async function actualizarIndicio(
  indicioId: number,
  payload: CrearIndicioDTO
): Promise<Indicio> {
  const { data } = await api.put<Indicio>(`/indicios/${indicioId}`, payload);
  return data;
}

export async function activarDesactivarIndicio(
  indicioId: number,
  activo: 0 | 1
): Promise<void> {
  await api.patch(`/indicios/${indicioId}/activo`, { activo });
}
