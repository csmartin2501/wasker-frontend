import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../../../core/models/producto.interface';
import { ProductoService } from '../../../../core/services/producto.service';
import { CartService } from '../../../../core/services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  @Output() productSelected = new EventEmitter<Producto | null>();
   
  products: Producto[] = [];
  selectedProductId: number | null = null;
  loading = false;
  searchTerm = '';
  editModalVisible = false;
  productToEdit: Producto | null = null;
  addedProductId: number | null = null;
  
  constructor(
    private productoService: ProductoService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productoService.getListProducts().subscribe({
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

    const resultado = this.products.filter(product => {
      const matchNombre   = product.nombre_producto?.toLowerCase().includes(term) ?? false;
      const matchSku      = product.sku_producto?.toString().toLowerCase().includes(term) ?? false;
      const rawAdulto     = product.productoCategoria?.es_categoria_adulto;
      const rawGatito     = product.productoCategoria?.es_categoria_gatito;
      const matchAdulto   = es_categoria_adulto && !!rawAdulto;
      const matchGatito   = es_categoria_gatito && !!rawGatito;
      const result          = matchNombre || matchSku || matchAdulto || matchGatito;

      return result;
    });

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
     return product.id_producto !== undefined && product.id_producto !== null ? product.id_producto : index;
   }

   editProduct(product: Producto): void {
     // Verificar que el producto tenga un ID válido antes de intentar editarlo
     if (!product || !product.id_producto) {
       Swal.fire('Error', 'Producto no válido para editar', 'error');
       return;
     }
     
     // Set the product to edit and show the modal
     this.productToEdit = { ...product }; // Create a copy to avoid modifying the original directly
     this.editModalVisible = true;
   }

   deleteProduct(product: Producto): void {
     const productId = product.id_producto;
     if (productId == null) {
       Swal.fire('Error', 'ID de producto no encontrado', 'error');
       return;
     }

     Swal.fire({
       title: '¿Estás seguro?',
       text: `¿Deseas eliminar el producto "${product.nombre_producto}"?`,
       icon: 'warning',
       showCancelButton: true,
       reverseButtons: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: 'gray',
       confirmButtonText: 'Sí, eliminar',
       cancelButtonText: 'Cancelar'
     }).then((result) => {
       if (result.isConfirmed) {
         this.productoService.deleteProduct(productId).subscribe({
           next: () => {
             console.log('Producto eliminado:', productId);
             // Remove the product from the list
             this.products = this.products.filter(p => p.id_producto !== productId);
             // If the deleted product was selected, clear selection
             if (this.selectedProductId === productId) {
               this.selectedProductId = null;
               this.productSelected.emit(null);
             }
             Swal.fire('Eliminado', 'Producto eliminado exitosamente', 'success');
           },
           error: (error) => {
             console.error('Error deleting product:', error);
             Swal.fire('Error', 'Error al eliminar el producto: ' + (error.message || 'Error desconocido'), 'error');
           }
         });
       }
     });
   }

   onProductSaved(event: any): void {
     const updatedProduct = event as Producto;
     // Update the product in the list
     const index = this.products.findIndex(p => p.id_producto === updatedProduct.id_producto);
     if (index !== -1) {
       this.products[index] = updatedProduct;
     }
     // If the updated product is the selected one, update the selection
     if (this.selectedProductId === updatedProduct.id_producto) {
       this.productSelected.emit(updatedProduct);
     }
     this.editModalVisible = false;
   }

  onModalClose(): void {
    this.editModalVisible = false;
    this.productToEdit = null;
  }

  onAddToCart(product: Producto, event: Event): void {
    event.stopPropagation();
    this.cartService.addItem(product);
    this.addedProductId = product.id_producto ?? null;
    setTimeout(() => {
      if (this.addedProductId === product.id_producto) {
        this.addedProductId = null;
      }
    }, 1200);
  }
}