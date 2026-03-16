import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProductoCategoria } from '../core/models/producto-categoria.interface';

export interface ProductoCreate {
  sku_producto: string;
  nombre_producto: string;
  stock?: number;
  precio_producto: number;
  imagen_url_producto?: string;
  id_producto_categoria: number;
}

export interface ProductoResponse {
  id_producto: number;
  sku_producto: string;
  nombre_producto: string;
  stock: number;
  precio_producto: number;
  imagen_url_producto?: string | null;
  id_producto_categoria: number;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = (environment.apiUrl || 'http://127.0.0.1:8000/api') + '/productos';

  constructor(private http: HttpClient) {}

  createProduct(product: ProductoCreate): Observable<ProductoResponse> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const payload = {
      ...product,
      stock: product.stock ?? 0
    };
    // Remove undefined values (specifically for optional fields like imagen_url_producto)
    const cleanPayload = { ...payload };
    Object.keys(cleanPayload).forEach(key => {
      if (cleanPayload[key as keyof ProductoCreate] === undefined) {
        delete cleanPayload[key as keyof ProductoCreate];
      }
    });

    return this.http.post<ProductoResponse>(this.baseUrl, cleanPayload, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = error.message || 'HTTP error';
        if (error.error instanceof ErrorEvent) {
          errorMsg = error.error.message;
        } else {
          const backendMsg = error.error?.detail || error.error?.message;
          if (backendMsg) {
            errorMsg = `${errorMsg}: ${backendMsg}`;
          }
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getCategories(): Observable<ProductoCategoria[]> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ProductoCategoria[]>(`${this.baseUrl}/categorias`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = error.message || 'HTTP error';
        if (error.error instanceof ErrorEvent) {
          errorMsg = error.error.message;
        } else {
          const backendMsg = error.error?.detail || error.error?.message;
          if (backendMsg) {
            errorMsg = `${errorMsg}: ${backendMsg}`;
          }
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}