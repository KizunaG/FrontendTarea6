export type Indicio = {
  id: number;
  expediente_id: number;
  descripcion: string;
  color?: string | null;
  tamano?: string | null;
  peso?: number | null;
  ubicacion?: string | null;
  activo: 0 | 1;
  creado_en?: string;
};

export type CrearIndicioDTO = {
  descripcion: string;
  color?: string;
  tamano?: string;
  peso?: number;
  ubicacion?: string;
};
