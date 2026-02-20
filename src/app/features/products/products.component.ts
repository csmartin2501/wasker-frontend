import { Component } from '@angular/core';
import { Product } from '../../core/models/product.interface';

@Component({
  selector: 'app-products',
  template: `
    <div class="container-fluid py-4">
      <div class="text-center mb-4">
        <h1 class="display-5 fw-bold text-primary">📦 Gestión de Productos</h1>
        <p class="text-muted">Administra tu inventario de forma eficiente</p>
      </div>
      
      <div class="row g-4">
        <!-- Lista de Productos -->
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">📋 Productos Disponibles</h5>
            </div>
            <div class="card-body">
              <app-product-list (productSelected)="onProductSelected($event)"></app-product-list>
            </div>
          </div>
        </div>
        
        <!-- Formulario CRUD -->
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">⚙️ Gestionar Producto</h5>
            </div>
            <div class="card-body">
              <app-product-form [selectedProduct]="selectedProduct"></app-product-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductsComponent {
  selectedProduct: Product | null = null;

  constructor() {}

  onProductSelected(product: Product): void {
    this.selectedProduct = product;
  }
}