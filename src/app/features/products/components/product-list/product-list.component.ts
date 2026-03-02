import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Product } from '../../../../core/models/product.interface';
import { ProductService } from '../../../../core/services/product.service';

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

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getListProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onProductSelect(product: Product): void {
    this.selectedProductId = product.id || null;
    this.productSelected.emit(product);
  }

  getFilteredProducts(): Product[] {
    if (!this.searchTerm.trim()) {
      // console.log(this.products);
      return this.products;
    }
    return this.products.filter(product =>
      product.nombre_producto?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.sku_producto?.toString()?.toLowerCase().includes(this.searchTerm.toLowerCase())
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