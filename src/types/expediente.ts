export interface Expediente {
  id: number;
  codigo: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  tecnico_id: number;
  tecnico?: string;
  aprobador_id?: number | null;
  aprobador?: string | null;
  justificacion?: string | null;
  fecha_estado?: string | null;     // ISO date
  creado_en?: string;
  actualizado_en?: string;
  activo: number | boolean;
}
