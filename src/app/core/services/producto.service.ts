import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producto } from '../models/producto.interface';
import { environment } from '../../../environments/environment';

export interface ProductoCreate {
  sku_producto: string;
  nombre_producto: string;
  stock?: number;
  precio_producto: number;
  imagen_url_producto?: string;
  id_producto_categoria: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getListProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/GetListProducts`);
  }

  createProduct(product: ProductoCreate): Observable<Producto> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.post<Producto>(`${this.apiUrl}/productos/`, product, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating product:', error);
        return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, product: Partial<ProductoCreate>): Observable<Producto> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, product, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating product:', error);
        return throwError(() => error);
      })
    );
  }

  deleteProduct(id: number | undefined): Observable<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.apiUrl}/productos/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting product:', error);
        return throwError(() => error);
      })
    );
  }
}
