import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

interface Categoria {
  id_producto_categoria: number;
  categoria_producto: string;
  es_categoria_adulto: boolean | null;
  es_categoria_gatito: boolean | null;
}

@Component({
  selector: 'app-categoria-list',
  templateUrl: './categoria-list.component.html'
})
export class CategoriaListComponent implements OnInit {
  categorias: Categoria[] = [];
  loading = false;
  showForm = false;
  form!: FormGroup;
  editId: number | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  private initForm(): void {
    this.form = this.fb.group({
      categoria_producto: ['', [Validators.required, Validators.maxLength(100)]],
      es_categoria_adulto: [false],
      es_categoria_gatito: [false]
    });
  }

  load(): void {
    this.loading = true;
    this.http.get<Categoria[]>(`${environment.apiUrl}/productos/categorias`).subscribe({
      next: (data) => { this.categorias = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(cat?: Categoria): void {
    this.editId = cat ? cat.id_producto_categoria : null;
    this.form.reset({
      categoria_producto: cat?.categoria_producto ?? '',
      es_categoria_adulto: cat?.es_categoria_adulto ?? false,
      es_categoria_gatito: cat?.es_categoria_gatito ?? false
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editId = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const body = this.form.value;
    const req$ = this.editId
      ? this.http.patch<Categoria>(`${environment.apiUrl}/productos/categorias/${this.editId}`, body)
      : this.http.post<Categoria>(`${environment.apiUrl}/productos/categorias`, body);

    req$.subscribe({
      next: () => {
        Swal.fire('Guardado', `Categoría ${this.editId ? 'actualizada' : 'creada'} correctamente.`, 'success');
        this.closeForm();
        this.load();
      },
      error: (err) => {
        const msg = err.error?.detail || 'No se pudo guardar la categoría.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  eliminar(cat: Categoria): void {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `"${cat.categoria_producto}" y sus referencias serán eliminadas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/productos/categorias/${cat.id_producto_categoria}`).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'Categoría eliminada.', 'success');
            this.load();
          },
          error: (err) => {
            const msg = err.error?.detail || 'No se pudo eliminar.';
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }

  get f() { return this.form.controls; }
}
