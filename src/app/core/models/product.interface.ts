export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
