import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../models/cart.interface';
import { Producto } from '../models/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  totalItems$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((acc, item) => acc + item.cantidad, 0))
  );

  total$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((acc, item) => acc + item.subtotal, 0))
  );

  get items(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  get total(): number {
    return this.items.reduce((acc, item) => acc + item.subtotal, 0);
  }

  get totalItems(): number {
    return this.items.reduce((acc, item) => acc + item.cantidad, 0);
  }

  addItem(producto: Producto, cantidad: number = 1): void {
    const current = this.items;
    const index = current.findIndex(i => i.producto.id_producto === producto.id_producto);

    if (index >= 0) {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        cantidad: updated[index].cantidad + cantidad,
        subtotal: (updated[index].cantidad + cantidad) * (producto.precio_producto ?? 0)
      };
      this.itemsSubject.next(updated);
    } else {
      const newItem: CartItem = {
        producto,
        cantidad,
        subtotal: cantidad * (producto.precio_producto ?? 0)
      };
      this.itemsSubject.next([...current, newItem]);
    }
  }

  removeItem(idProducto: number): void {
    this.itemsSubject.next(
      this.items.filter(i => i.producto.id_producto !== idProducto)
    );
  }

  updateCantidad(idProducto: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.removeItem(idProducto);
      return;
    }

    const updated = this.items.map(item =>
      item.producto.id_producto === idProducto
        ? { ...item, cantidad, subtotal: cantidad * (item.producto.precio_producto ?? 0) }
        : item
    );
    this.itemsSubject.next(updated);
  }

  clearCart(): void {
    this.itemsSubject.next([]);
  }
}
