import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Producto } from '../models/producto.interface';
import { ProductoCategoria } from '../models/producto-categoria.interface';
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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

  getCategories(): Observable<ProductoCategoria[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.get<ProductoCategoria[]>(`${this.apiUrl}/productos/categorias`, { headers }).pipe(
      catchError((error) => {
        console.error('Error loading categories:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si ya existe una imagen con el nombre especificado
   * En una aplicación real, esto haría una petición al backend
   * @param fileName Nombre del archivo a verificar
   * @returns Observable que emite true si existe, false si no existe
   */
  checkIfImageExists(fileName: string): Observable<boolean> {
    // En una implementación real, esto sería:
    // return this.http.get<boolean>(`${this.apiUrl}/productos/imagenes/exists/${fileName}`);
    
    // Para este ejemplo, simulamos la respuesta
    // En un caso real, se haría una llamada al backend
    return of(false);
  }
}
