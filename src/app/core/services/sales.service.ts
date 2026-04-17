import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Venta, VentaCreate, VentaCreateResponse } from '../models/venta.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private readonly apiUrl = environment.apiUrl;

  // Subjects for state management
  private ventasSubject = new BehaviorSubject<Venta[]>([]);
  private selectedSaleSubject = new BehaviorSubject<Venta | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Observables for components to subscribe to
  ventas$ = this.ventasSubject.asObservable();
  selectedSale$ = this.selectedSaleSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Get all sales
  getSales(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const token = localStorage.getItem('token');
    if (!token) {
      this.loadingSubject.next(false);
      this.errorSubject.next('Authentication required');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    this.http.get<Venta[]>(`${this.apiUrl}/ventas/`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error loading sales:', error);
          this.loadingSubject.next(false);
          let errorMsg = 'Error al cargar las ventas';
          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.status === 0) {
            errorMsg = 'No se pudo conectar al servidor';
          }
          this.errorSubject.next(errorMsg);
          return throwError(() => error);
        }),
        tap(ventas => {
          // Calculate computed properties for each venta
          const processedVentas = ventas.map(venta => ({
            ...venta,
            totalItems: venta.detalle?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0,
            subtotal: venta.detalle?.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) || 0,
            total: venta.detalle?.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) || 0
          }));
          this.ventasSubject.next(processedVentas);
          this.loadingSubject.next(false);
        })
      )
      .subscribe();
  }

  // Get sale by ID
  getSaleById(id: number): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const token = localStorage.getItem('token');
    if (!token) {
      this.loadingSubject.next(false);
      this.errorSubject.next('Authentication required');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    this.http.get<Venta>(`${this.apiUrl}/ventas/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error loading sale:', error);
          this.loadingSubject.next(false);
          let errorMsg = 'Error al cargar la venta';
          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.status === 404) {
            errorMsg = 'Venta no encontrada';
          } else if (error.status === 0) {
            errorMsg = 'No se pudo conectar al servidor';
          }
          this.errorSubject.next(errorMsg);
          return throwError(() => error);
        }),
        tap(sale => {
          // Calculate computed properties
          const processedSale = {
            ...sale,
            totalItems: sale.detalle?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0,
            subtotal: sale.detalle?.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) || 0,
            total: sale.detalle?.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) || 0
          };
          this.selectedSaleSubject.next(processedSale);
          this.loadingSubject.next(false);
        })
      )
      .subscribe();
  }

  // Create a sale from cart data
  createSaleFromCart(cartData: {
    id_cliente: number;
    id_vendedor: number;
    id_tipo_pago: number;
    items: {
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
    }[]
  }): Observable<VentaCreateResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    const ventaData: VentaCreate = {
      id_cliente: cartData.id_cliente,
      id_vendedor: cartData.id_vendedor,
      id_tipo_pago: cartData.id_tipo_pago,
      detalle: cartData.items
    };

    return this.http.post<VentaCreateResponse>(`${this.apiUrl}/ventas/`, ventaData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error creating sale:', error);
          let errorMsg = 'Error al crear la venta';
          if (error.error?.detail) {
            errorMsg = error.error.detail;
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }
          return throwError(() => ({ ...error, userMessage: errorMsg }));
        })
      );
  }

  // Clear errors
  clearError(): void {
    this.errorSubject.next(null);
  }
}
