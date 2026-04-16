import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Venta } from '../../../core/models/venta.interface';
import { SalesService } from '../../../core/services/sales.service';

@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.component.html',
  styleUrls: []
})
export class SalesDetailComponent implements OnInit {
  venta$!: Observable<Venta | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService
  ) {
    this.loading$ = this.salesService.loading$;
    this.error$ = this.salesService.error$;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.salesService.getSaleById(id);
      this.venta$ = this.salesService.selectedSale$;
    }
  }
}
