import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from '../../../../core/models/cart.interface';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-detail',
  templateUrl: './cart-detail.component.html',
  styleUrls: ['./cart-detail.component.css']
})
export class CartDetailComponent implements OnInit {
  items$!: Observable<CartItem[]>;
  total$!: Observable<number>;
  totalItems$!: Observable<number>;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.items$ = this.cartService.items$;
    this.total$ = this.cartService.total$;
    this.totalItems$ = this.cartService.totalItems$;
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

  // Confirm purchase - using default values for now, should be replaced with actual client/seller/payment selection
  onConfirmPurchase(): void {
    // These would ideally come from a user selection or profile
    const id_cliente = 1; // Default client ID
    const id_vendedor = 1; // Default seller ID
    const id_tipo_pago = 1; // Default payment type (efectivo)

    this.cartService.confirmPurchase(id_cliente, id_vendedor, id_tipo_pago).subscribe({
      next: (success) => {
        if (success) {
          // Success is handled in the service (navigation to sales)
        }
      },
      error: (error) => {
        console.error('Error confirming purchase:', error);
        alert('Error al procesar la compra. Por favor intente nuevamente.');
      }
    });
  }

  trackByProductId(_: number, item: CartItem): number {
    return item.producto.id_producto ?? 0;
  }
}
