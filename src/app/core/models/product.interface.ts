export interface Product {
  id?: number;
  nombre_producto?: string;
  sku_producto?: string;
  precio_producto?: number;
  stock?: number;
  fecha_creacion?: string;
  id_categoriaproducto?: number;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number;
}
