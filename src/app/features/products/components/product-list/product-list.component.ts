import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../../core/models/product.interface';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  @Output() productSelected = new EventEmitter<Product>();
  
  products: Product[] = [];
  selectedProductId: number | null = null;
  loading = false;
  searchTerm = '';

  constructor() { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // TODO: Implementar llamada al servicio
    // this.productService.getProducts().subscribe({
    //   next: (products) => {
    //     this.products = products;
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading products:', error);
    //     this.loading = false;
    //   }
    // });

    // Datos de ejemplo para pruebas
    setTimeout(() => {
      this.products = [
        { id: 1, name: 'Producto 1', price: 10.99, stock: 25, description: 'Descripción del producto 1' },
        { id: 2, name: 'Producto 2', price: 15.99, stock: 10, description: 'Descripción del producto 2' },
        { id: 3, name: 'Producto 3', price: 8.99, stock: 0, description: 'Descripción del producto 3' }
      ];
      this.loading = false;
    }, 1000);
  }

  onProductSelect(product: Product): void {
    this.selectedProductId = product.id || null;
    this.productSelected.emit(product);
  }

  getFilteredProducts(): Product[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }
    return this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  refreshList(): void {
    this.loadProducts();
  }

  trackByProductId(index: number, product: Product): number {
    return product.id || index;
  }
}