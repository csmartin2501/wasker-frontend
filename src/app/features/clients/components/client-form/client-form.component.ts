import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  form!: FormGroup;
  isEditing = false;
  clienteId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      rut: ['', [Validators.required, Validators.minLength(8)]],
      nombres: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.clienteId = +id;
      this.loading = true;
      this.clienteService.getCliente(this.clienteId).subscribe({
        next: (c) => {
          this.form.patchValue({
            rut: c.rut,
            nombres: c.nombres,
            apellido_paterno: c.apellido_paterno,
            apellido_materno: c.apellido_materno
          });
          this.loading = false;
        },
        error: () => {
          Swal.fire('Error', 'No se pudo cargar el cliente.', 'error');
          this.router.navigate(['/clients/list']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { rut, nombres, apellido_paterno, apellido_materno } = this.form.value;
    const nombre_completo = [nombres, apellido_paterno, apellido_materno].filter(Boolean).join(' ');
    const data = { rut, nombre_completo, nombres, apellido_paterno, apellido_materno };

    const request$ = this.isEditing && this.clienteId
      ? this.clienteService.updateCliente(this.clienteId, data)
      : this.clienteService.createCliente(data);

    request$.subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('Guardado', `Cliente ${this.isEditing ? 'actualizado' : 'creado'} correctamente.`, 'success');
        this.router.navigate(['/clients/list']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'No se pudo guardar el cliente.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  get f() { return this.form.controls; }
}
