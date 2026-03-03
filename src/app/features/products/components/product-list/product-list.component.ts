import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../../../core/models/producto.interface';
import { ProductoService } from '../../../../core/services/producto.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  @Output() productSelected = new EventEmitter<Producto>();
  
  products: Producto[] = [];
  selectedProductId: number | null = null;
  loading = false;
  searchTerm = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.loadProducts();
    // console.log(this.products)
  }

  loadProducts(): void {
    this.loading = true;
    this.productoService.getListProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        // DEBUG: ver estructura exacta del primer producto
        // if (products.length > 0) {
        //   console.log('Keys del primer producto:', Object.keys(products[0]));
        //   console.log('Primer producto completo (raw):', JSON.stringify(products[0], null, 2));
        // }
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onProductSelect(product: Producto): void {
    this.selectedProductId = product.id_producto || null;
    this.productSelected.emit(product);
  }

  getFilteredProducts(): Producto[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }

    const term = this.searchTerm.toLowerCase();
    const es_categoria_adulto = term === 'adulto';
    const es_categoria_gatito = term === 'gatito';

    // console.group(`[Filtro] término: "${this.searchTerm}"`);
    // console.log('es_categoria_adulto:', es_categoria_adulto);
    // console.log('es_categoria_gatito:', es_categoria_gatito);

    const resultado = this.products.filter(product => {
      const matchNombre   = product.nombre_producto?.toLowerCase().includes(term) ?? false;
      const matchSku      = product.sku_producto?.toString().toLowerCase().includes(term) ?? false;
      const rawAdulto     = product.productoCategoria?.es_categoria_adulto;
      const rawGatito     = product.productoCategoria?.es_categoria_gatito;
      const matchAdulto   = es_categoria_adulto && !!rawAdulto;
      const matchGatito   = es_categoria_gatito && !!rawGatito;
      const result          = matchNombre || matchSku || matchAdulto || matchGatito;

      // console.log({
      //   nombre:       product.nombre_producto,
      //   categoria:    product.productoCategoria,
      //   rawAdulto,
      //   rawGatito,
      //   matchNombre,
      //   matchSku,
      //   matchAdulto,
      //   matchGatito,
      //   result
      // });

      return result;
    });

    // console.log(`Resultados: ${resultado.length} de ${this.products.length}`);
    // console.groupEnd();

    return resultado;
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  refreshList(): void {
    this.loadProducts();
  }

  trackByProductId(index: number, product: Producto): number {
    return product.id_producto || index;
  }
}