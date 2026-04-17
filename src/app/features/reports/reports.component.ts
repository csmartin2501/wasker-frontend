import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ReporteVentas {
  total_ventas: number;
  monto_total: number;
  ticket_promedio: number;
  productos_mas_vendidos: { nombre_producto: string; total_vendido: number }[];
  stock_critico: { nombre_producto: string; stock_actual: number; stock_minimo: number }[];
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  reporte: ReporteVentas | null = null;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReporte();
  }

  loadReporte(): void {
    this.loading = true;
    this.error = null;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<ReporteVentas>(`${environment.apiUrl}/reportes/resumen`, { headers })
      .subscribe({
        next: (data) => {
          this.reporte = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cargar el reporte';
          this.loading = false;
        }
      });
  }
}
