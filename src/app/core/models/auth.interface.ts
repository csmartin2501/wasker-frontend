export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
}

export interface UserPayload {
  sub: string | number;
  username: string;
  perfil?: string;
  id_usuario?: number;
  exp: number;
}
