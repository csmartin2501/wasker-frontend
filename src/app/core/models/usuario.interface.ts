export interface UsuarioResponse {
  id_usuario: number;
  nombre_usuario: string;
  fecha_creacion?: string;
  ultima_conexion?: string;
  perfil?: string;
  nombre_completo?: string;
}

export interface UsuarioCreate {
  nombre_usuario: string;
  password: string;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  id_perfil: number;
}

export interface PerfilResponse {
  id_perfil: number;
  perfil: string;
}
