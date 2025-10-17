export type UserRole = 'tecnico' | 'coordinador';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: 'tecnico' | 'coordinador';

  };
}

