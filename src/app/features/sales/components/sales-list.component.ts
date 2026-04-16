import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Venta } from '../../../core/models/venta.interface';
import { SalesService } from '../../../core/services/sales.service';

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.css']
})
export class SalesListComponent implements OnInit {
  ventas$!: Observable<Venta[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private salesService: SalesService) {
    this.loading$ = this.salesService.loading$;
    this.error$ = this.salesService.error$;
  }

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.salesService.getSales();
  }

  trackById(index: number, venta: Venta): number {
    return venta.id_venta ?? 0;
  }
}
