import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface ResumenReporte {
  total_ventas: number;
  monto_total: number;
  ticket_promedio: number;
  productos_mas_vendidos: { nombre_producto: string; total_vendido: number }[];
  stock_critico: { nombre_producto: string; stock_actual: number; stock_minimo: number }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  reporte: ResumenReporte | null = null;
  loading = false;

  constructor(
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loading = true;
      this.http.get<ResumenReporte>(`${environment.apiUrl}/reportes/resumen`).subscribe({
        next: (data) => { this.reporte = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  get username(): string {
    return this.authService.getUserPayload()?.username || 'Usuario';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
