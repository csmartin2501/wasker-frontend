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

  trackByProductId(_: number, item: CartItem): number {
    return item.producto.id_producto ?? 0;
  }
}
