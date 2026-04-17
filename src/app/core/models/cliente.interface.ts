export interface Cliente {
  id_cliente: number;
  fecha_creacion?: string;
  fecha_ultima_compra?: string;
  id_persona?: number;
  nombre_completo?: string;
  rut?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
}

export interface ClienteCreate {
  rut: string;
  nombre_completo: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
}
