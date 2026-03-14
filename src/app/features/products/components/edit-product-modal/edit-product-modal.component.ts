import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Producto } from '../../../../core/models/producto.interface';
import { ProductoService } from '../../../../core/services/producto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-product-modal',
  templateUrl: './edit-product-modal.component.html'
})
export class EditProductModalComponent {
  @Input() visible: boolean = false;
  @Input() product: Producto | null = null;
  @Output() save = new EventEmitter<Producto>();
  @Output() close = new EventEmitter<void>();

  // Formulario properties
  nombreProducto: string = '';
  precioProducto: number = 0;
  stockProducto: number = 0;
  skuProducto: string = '';
  imagenUrlProducto: string = '';
  categoriaId: number = 0;

  constructor(private productoService: ProductoService) {}

  getScrollbarWidth(): number {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return 0;
    }
    
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    // Adding msOverflowStyle for IE compatibility, but checking if it exists first
    // @ts-ignore: IE specific property
    if ('msOverflowStyle' in outer.style) {
      outer.style.msOverflowStyle = 'scrollbar';
    }
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);
    return scrollbarWidth;
  }

  ngOnChanges(): void {
    // Actualizar las propiedades del formulario cuando cambie el producto de entrada
    if (this.product) {
      this.nombreProducto = this.product.nombre_producto || '';
      this.precioProducto = this.product.precio_producto || 0;
      this.stockProducto = this.product.stock || 0;
      this.skuProducto = this.product.sku_producto || '';
      this.imagenUrlProducto = this.product.imagen_url_producto || '';
      this.categoriaId = this.product.productoCategoria?.id_producto_categoria || 0;
    } else {
      // Resetear el formulario si no hay producto
      this.nombreProducto = '';
      this.precioProducto = 0;
      this.stockProducto = 0;
      this.skuProducto = '';
      this.imagenUrlProducto = '';
      this.categoriaId = 0;
    }
  }

  onSave(): void {
    if (!this.product || !this.product.id_producto) {
      Swal.fire('Error', 'Producto no válido para editar', 'error');
      return;
    }

    // Actualizar el producto con los valores del formulario
    this.product.nombre_producto = this.nombreProducto;
    this.product.precio_producto = this.precioProducto;
    this.product.stock = this.stockProducto;
    this.product.sku_producto = this.skuProducto;
    this.product.imagen_url_producto = this.imagenUrlProducto;
    
    // Actualizar la categoría si existe
    if (this.product.productoCategoria) {
      this.product.productoCategoria.id_producto_categoria = this.categoriaId;
    }

    // Llamar al servicio para actualizar el producto
    this.productoService.updateProduct(this.product.id_producto, this.product).subscribe({
      next: (updatedProduct) => {
        Swal.fire('Actualizado', 'Producto actualizado exitosamente', 'success');
        this.save.emit(updatedProduct);
        this.close.emit();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        Swal.fire('Error', 'Error al actualizar el producto: ' + (error.message || 'Error desconocido'), 'error');
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}