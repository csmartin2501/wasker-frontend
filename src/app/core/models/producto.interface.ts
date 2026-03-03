import { ProductoCategoria } from "./producto-categoria.interface";

export interface Producto {
  id_producto?: number;
  nombre_producto?: string;
  sku_producto?: string;
  precio_producto?: number;
  stock?: number;
  fecha_creacion?: string;
  imagen_url_producto?: string;
  productoCategoria?: ProductoCategoria;
}

export interface ProductoCreateRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
}

export interface ProductoUpdateRequest extends Partial<ProductoCreateRequest> {
  id: number;
}
