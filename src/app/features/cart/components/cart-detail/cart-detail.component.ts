import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { CartItem } from '../../../../core/models/cart.interface';
import { CartService } from '../../../../core/services/cart.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { Cliente } from '../../../../core/models/cliente.interface';
import { environment } from '../../../../../environments/environment';

interface TipoPago {
  id_tipo_pago: number;
  tipo_pago: string;
}

@Component({
  selector: 'app-cart-detail',
  templateUrl: './cart-detail.component.html',
  styleUrls: ['./cart-detail.component.css']
})
export class CartDetailComponent implements OnInit {
  items$!: Observable<CartItem[]>;
  total$!: Observable<number>;
  totalItems$!: Observable<number>;

  clientes: Cliente[] = [];
  tiposPago: TipoPago[] = [];
  selectedClienteId: number | null = null;
  selectedTipoPagoId: number | null = null;
  procesando = false;

  constructor(
    private cartService: CartService,
    private clienteService: ClienteService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.items$ = this.cartService.items$;
    this.total$ = this.cartService.total$;
    this.totalItems$ = this.cartService.totalItems$;
    this.loadClientes();
    this.loadTiposPago();
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error('Error cargando clientes', err)
    });
  }

  loadTiposPago(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<TipoPago[]>(`${environment.apiUrl}/tipos-pago/`, { headers }).subscribe({
      next: (data) => this.tiposPago = data,
      error: (err) => console.error('Error cargando tipos de pago', err)
    });
  }

  onChangeCantidad(idProducto: number, event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.cartService.updateCantidad(idProducto, value);
  }

  onRemove(idProducto: number): void {
    this.cartService.removeItem(idProducto);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  get canConfirm(): boolean {
    return !!this.selectedClienteId && !!this.selectedTipoPagoId;
  }

  onConfirmPurchase(): void {
    if (!this.selectedClienteId || !this.selectedTipoPagoId) {
      Swal.fire('Atención', 'Debes seleccionar un cliente y tipo de pago.', 'warning');
      return;
    }

    this.procesando = true;
    this.cartService.confirmPurchase(this.selectedClienteId, 1, this.selectedTipoPagoId).subscribe({
      next: () => { this.procesando = false; },
      error: (error) => {
        this.procesando = false;
        const msg = error.userMessage || error.error?.detail || error.error?.message || 'Error al procesar la venta.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  trackByProductId(_: number, item: CartItem): number {
    return item.producto.id_producto ?? 0;
  }
}
