import { Component } from '@angular/core';
import { Product } from '../../core/models/product.interface';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  selectedProduct: Product | null = null;

  constructor() {}

  onProductSelected(product: Product): void {
    this.selectedProduct = product;
  }
}