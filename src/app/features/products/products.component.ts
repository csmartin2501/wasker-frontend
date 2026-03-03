import { Component } from '@angular/core';
import { Producto } from '../../core/models/producto.interface';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  selectedProduct: Producto | null = null;

  constructor() {}

  onProductSelected(product: Producto): void {
    this.selectedProduct = product;
  }
}