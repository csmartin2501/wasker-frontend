export interface Venta {
  id_venta: number;
  fecha_venta: string; // Date in ISO format
  id_cliente: number;
  id_vendedor: number;
  id_tipo_pago: number;
  
  // Related entities (populated via JOIN)
  cliente?: {
    id_cliente: number;
    nombre_persona: string;
    // Add other cliente fields if needed
  };
  
  vendedor?: {
    id_vendedor: number;
    nombre_persona: string;
    // Add other vendedor fields if needed
  };
  
  tipoPago?: {
    id_tipo_pago: number;
    tipo_pago: string;
  };
  
  // Detalle de venta
  detalle?: {
    id_detalle: number;
    id_venta: number;
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    producto?: {
      id_producto: number;
      nombre_producto: string;
      sku_producto: string;
    };
  }[];
  
  // Computed properties for frontend convenience
  totalItems?: number;
  subtotal?: number;
  total?: number;
}

export interface VentaCreate {
  id_cliente: number;
  id_vendedor: number;
  id_tipo_pago: number;
  id_sucursal?: number;
  detalle: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface VentaCreateResponse {
  id_venta: number;
  fecha_venta: string;
  id_cliente: number;
  id_vendedor: number;
  id_tipo_pago: number;
  stock_critico: boolean;
}

export interface VentaResponse {
  id_venta: number;
  fecha_venta: string;
  id_cliente: number;
  id_vendedor: number;
  id_tipo_pago: number;
}
