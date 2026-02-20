import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../../../../core/models/product.interface';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() selectedProduct: Product | null = null;
  
  productForm!: FormGroup;
  formMode: 'create' | 'update' = 'create';
  loading = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      image: ['']
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


  private loadProductToForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
      image: product.image || ''
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
      this.updateProduct({ ...formData, id: this.selectedProduct.id });
    }
  }

  createProduct(productData: ProductCreateRequest): void {
    // TODO: Implementar llamada al servicio
    // this.productService.createProduct(productData).subscribe({
    //   next: (createdProduct) => {
    //     console.log('Producto creado:', createdProduct);
    //     this.resetForm();
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error creando producto:', error);
    //     this.loading = false;
    //   }
    // });

    // Simulación
    setTimeout(() => {
      console.log('Producto creado:', productData);
      this.resetForm();
      this.loading = false;
      alert('Producto creado exitosamente');
    }, 1000);
  }

  updateProduct(productData: ProductUpdateRequest): void {
    // TODO: Implementar llamada al servicio
    // this.productService.updateProduct(productData).subscribe({
    //   next: (updatedProduct) => {
    //     console.log('Producto actualizado:', updatedProduct);
    //     this.loading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error actualizando producto:', error);
    //     this.loading = false;
    //   }
    // });

    // Simulación
    setTimeout(() => {
      console.log('Producto actualizado:', productData);
      this.loading = false;
      alert('Producto actualizado exitosamente');
    }, 1000);
  }

  deleteProduct(): void {
    if (!this.selectedProduct || !this.selectedProduct.id) return;

    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.loading = true;
    
    // TODO: Implementar llamada al servicio
    // this.productService.deleteProduct(this.selectedProduct.id).subscribe({
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
      console.log('Producto eliminado:', this.selectedProduct?.id);
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