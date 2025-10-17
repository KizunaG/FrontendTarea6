export type Rol = 'tecnico' | 'coordinador';

export interface Usuario {
  id: number;
  username: string;
  role: Rol;
  activo: number | boolean;
}

export interface ListarUsuariosResp {
  data: Usuario[];
  total: number;
}
