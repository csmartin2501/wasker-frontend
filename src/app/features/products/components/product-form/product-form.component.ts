import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto, ProductoCreateRequest, ProductoUpdateRequest } from '../../../../core/models/producto.interface';
import { ProductoCategoria } from '../../../../core/models/producto-categoria.interface';
import { ProductService } from '../../../../services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() selectedProduct: Producto | null = null;
   
  productForm!: FormGroup;
  formMode: 'create' | 'update' = 'create';
  loading = false;
  categories: ProductoCategoria[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      image: ['']
    });
    
    // Load categories for the dropdown
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Categories loaded:', categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Optionally show a message to the user
      }
    });
  }

  ngOnChanges(): void {
    
    if (this.selectedProduct) {
      this.formMode = 'update';
      this.loadProductToForm(this.selectedProduct);
    } else {
      this.formMode = 'create';
      this.resetForm();
    }
  }


    private loadProductToForm(product: Producto): void {
        this.productForm.patchValue({
          name: product.nombre_producto,
          // description: product.description || '',
          price: product.precio_producto,
          stock: product.stock,
          category: product.productoCategoria?.id_producto_categoria?.toString() || '',
          // image: product.image || ''
        });
      }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formData = this.productForm.value;

    if (this.formMode === 'create') {
      this.createProduct(formData);
    } else if (this.formMode === 'update' && this.selectedProduct) {
      this.updateProduct({ ...formData, id: this.selectedProduct.id_producto });
    }
  }

    createProduct(productData: ProductoCreateRequest): void {
      // Map form data to service format
      const productToCreate: any = {
        nombre_producto: productData.name,
        precio_producto: productData.price,
        stock: productData.stock,
        imagen_url_producto: productData.image || undefined,
        // Note: sku_producto is missing from form - this needs to be added to the form
        // For now using a placeholder - THIS IS A TEMPORARY SOLUTION
        sku_producto: `TEMP-${Date.now()}`,
        // Note: category needs to be converted from string to number
        id_producto_categoria: productData.category ? parseInt(productData.category, 10) : 0
      };

      this.productService.createProduct(productToCreate).subscribe({
        next: (createdProduct) => {
          console.log('Producto creado:', createdProduct);
          this.resetForm();
          this.loading = false;
          alert('Producto creado exitosamente');
        },
        error: (error) => {
          console.error('Error creando producto:', error);
          this.loading = false;
          alert('Error al crear el producto: ' + error.message);
        }
      });
    }

    updateProduct(productData: ProductoUpdateRequest): void {
      if (!this.selectedProduct || !this.selectedProduct.id_producto) {
        this.loading = false;
        alert('Error: No hay producto seleccionado para actualizar');
        return;
      }

      // Map form data to service format
      const productToUpdate: any = {
        id_producto: this.selectedProduct.id_producto,
        nombre_producto: productData.name,
        precio_producto: productData.price,
        stock: productData.stock,
        imagen_url_producto: productData.image || undefined,
        // Note: sku_producto is missing from form - keeping existing value
        sku_producto: this.selectedProduct.sku_producto,
        // Note: category needs to be converted from string to number
        id_producto_categoria: productData.category ? parseInt(productData.category, 10) : this.selectedProduct.productoCategoria?.id_producto_categoria || 0
      };

      // For update, we would need an update method in the service
      // Since we only created createProduct, we'll show a message for now
      alert('Funcionalidad de actualización pendiente de implementar en el servicio');
      this.loading = false;
    }

  deleteProduct(): void {
    if (!this.selectedProduct || !this.selectedProduct.id_producto) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.loading = true;
    
    // TODO: Implementar llamada al servicio
    // this.productService.deleteProduct(this.selectedProduct.id_producto).subscribe({
    //   next: () => {
    //     console.log('Producto eliminado');
    //     this.resetForm();
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error eliminando producto:', error);
    //     this.loading = false;
    //   }
    // });

    // Simulación
    setTimeout(() => {
      console.log('Producto eliminado:', this.selectedProduct?.id_producto);
      this.resetForm();
      this.loading = false;
      alert('Producto eliminado exitosamente');
    }, 1000);
  }

  resetForm(): void {
    this.formMode = 'create';
    this.selectedProduct = null;
    this.productForm.reset();
    this.productForm.patchValue({
      price: 0,
      stock: 0
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.errors && control?.touched) {
      const errors = control.errors;
      
      if (errors['required']) return `${fieldName} es requerido`;
      if (errors['minlength']) return `${fieldName} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `${fieldName} no puede exceder ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['min']) return `${fieldName} debe ser mayor a ${errors['min'].min}`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control?.invalid && control?.touched);
  }
}