import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
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
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/`);
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
   * Sube una imagen al servidor usando FormData
   * @param file Archivo de imagen a subir
   * @returns Observable que emite la respuesta del backend (asumiendo que devuelve la URL de la imagen)
   */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    // No establecer Content-Type manualmente para FormData
    // El navegador lo establecerá automáticamente con el boundary correcto
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    
    // Asumimos que existe un endpoint para subir imágenes
    // En una implementación real, esto sería algo como:
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/productos/upload-image`, formData, { headers }).pipe(
      map(response => response.imageUrl),
        catchError(error => {
         console.error('Error uploading image:', error);
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
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    
    // Asumimos que existe un endpoint para verificar existencia de imágenes
    // En una implementación real, esto sería:
    // return this.http.get<boolean>(`${this.apiUrl}/productos/imagenes/exists/${fileName}`, { headers });
    
    // Por ahora, simulamos la respuesta (se reemplazará con la llamada real cuando el backend esté listo)
    return of(false).pipe(
      delay(500) // Simular latencia de red
    );
  }

  getBackendImageUrl(fileName: string | null | undefined): Observable<string> {

    if (!fileName) {
      return of('assets/images/no-image.png')
    }
  
    return this.http
      .get<string>(`${this.apiUrl}/productos/images/${fileName}`)
      .pipe(
        map(resp => {
          // si backend devuelve solo nombre
          if (!resp.startsWith('http')) {
            return `${this.apiUrl}/images/${resp}`
          }
          return resp
        }),
        catchError(() => of('assets/images/no-image.png'))
      )
  }
}
