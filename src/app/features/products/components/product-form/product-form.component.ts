import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto, ProductoCreateRequest, ProductoUpdateRequest } from '../../../../core/models/producto.interface';
import { ProductoCategoria } from '../../../../core/models/producto-categoria.interface';
import { ProductoService } from '../../../../core/services/producto.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

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
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductoService
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
       next: (categories: ProductoCategoria[]) => {
         this.categories = categories;
         console.log('Categories loaded:', categories);
       },
       error: (error: any) => {
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

      // Manejar selección de archivo de imagen
      onImageSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
          // Validar que no exista un archivo con el mismo nombre (de forma síncrona para simplificar)
          this.validateImageName(file.name).then((exists) => {
            if (exists) {
              // Pedir al usuario que cambie el nombre
              const newName = prompt(`Ya existe una imagen con el nombre "${file.name}". Por favor, ingrese un nuevo nombre para la imagen:`);
              if (newName && newName.trim() !== '') {
                // Crear un nuevo archivo con el nuevo nombre
                const newFile = new File([file], newName.trim(), { type: file.type });
                const objectUrl = URL.createObjectURL(newFile);
                this.productForm.patchValue({ image: objectUrl });
                // Guardar el archivo original para subirlo más tarde
                this.selectedFile = newFile;
              } else {
                // Si el usuario cancela o deja vacío, limpiar el campo
                event.target.value = '';
                this.productForm.patchValue({ image: null });
                this.selectedFile = null;
                Swal.fire('Información', 'Operación cancelada. No se seleccionó ninguna imagen.', 'info');
              }
            } else {
              // No existe archivo con ese nombre, proceder normalmente
              const objectUrl = URL.createObjectURL(file);
              this.productForm.patchValue({ image: objectUrl });
              // Guardar el archivo original para subirlo más tarde
              this.selectedFile = file;
            }
          });
        }
      }

     // Validar si ya existe una imagen con el mismo nombre
     private async validateImageName(fileName: string): Promise<boolean> {
       // En una aplicación real, esto haría una petición al backend
       // Por ahora, simulamos verificando en el frontend (esto sería una llamada al backend en producción)
       // Para este ejemplo, asumimos que no existe y retornamos false
       // En un caso real, sería algo como:
       // return this.productService.checkIfImageExists(fileName);
       return false;
     }

      createProduct(productData: ProductoCreateRequest): void {
        // Si no hay archivo seleccionado, crear el producto directamente
        if (!this.selectedFile) {
          this.createProductWithoutImage(productData);
          return;
        }

        // Mostrar indicador de carga
        this.loading = true;
        
        // Primero, subir la imagen
        this.productService.uploadImage(this.selectedFile).subscribe({
          next: (imageUrl: string) => {
            console.log('Imagen subida exitosamente:', imageUrl);
            
            // Mapear datos del formulario al formato del servicio
            const productToCreate: any = {
              nombre_producto: productData.name,
              precio_producto: productData.price,
              stock: productData.stock,
              // Guardar la URL de la imagen subida
              imagen_url_producto: imageUrl,
              // Note: sku_producto is missing from form - this needs to be added to the form
              // For now using a placeholder - THIS IS A TEMPORARY SOLUTION
              sku_producto: `TEMP-${Date.now()}`,
              // Note: category needs to be converted from string to number
              id_producto_categoria: productData.category ? parseInt(productData.category, 10) : 0
            };

            console.log('Datos que se enviarán al servicio:', productToCreate);
            
            // Luego, crear el producto con la URL de la imagen
            this.productService.createProduct(productToCreate).subscribe({
              next: (createdProduct: any) => {
                console.log('Producto creado:', createdProduct);
                this.resetForm();
                this.loading = false;
                Swal.fire('Éxito', 'Producto creado exitosamente', 'success');
              },
              error: (error: any) => {
                console.error('Error creando producto:', error);
                this.loading = false;
                Swal.fire('Error', 'Error al crear el producto: ' + error.message, 'error');
              }
            });
          },
          error: (error: any) => {
            console.error('Error subiendo imagen:', error);
            this.loading = false;
            Swal.fire('Error', 'Error al subir la imagen: ' + error.message, 'error');
          }
        });
      }

      // Método auxiliar para crear producto sin imagen
      private createProductWithoutImage(productData: ProductoCreateRequest): void {
        // Mapear datos del formulario al formato del servicio
        const productToCreate: any = {
          nombre_producto: productData.name,
          precio_producto: productData.price,
          stock: productData.stock,
          // No hay imagen
          imagen_url_producto: undefined,
          // Note: sku_producto is missing from form - this needs to be added to the form
          // For now using a placeholder - THIS IS A TEMPORARY SOLUTION
          sku_producto: `TEMP-${Date.now()}`,
          // Note: category needs to be converted from string to number
          id_producto_categoria: productData.category ? parseInt(productData.category, 10) : 0
        };

        console.log('Datos que se enviarán al servicio (sin imagen):', productToCreate);
        
        this.productService.createProduct(productToCreate).subscribe({
          next: (createdProduct: any) => {
            console.log('Producto creado:', createdProduct);
            this.resetForm();
            this.loading = false;
            Swal.fire('Éxito', 'Producto creado exitosamente', 'success');
          },
          error: (error: any) => {
            console.error('Error creando producto:', error);
            this.loading = false;
            Swal.fire('Error', 'Error al crear el producto: ' + error.message, 'error');
          }
        });
      }

     // Extraer el nombre del archivo de una URL de objeto
     private extractFileName(url: string): string {
       // Para URLs de objeto (blob:), extraemos el nombre que guardamos previamente
       // En una implementación real, esto sería manejado por el backend después de la subida
       if (url.startsWith('blob:')) {
         // En este caso, asumimos que ya hemos validado el nombre antes
         // En un caso real, el backend devolvería la ruta donde se guardó el archivo
         return url.split('/').pop() || '';
       }
       return url;
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
       Swal.fire('Información', 'Funcionalidad de actualización pendiente de implementar en el servicio', 'info');
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