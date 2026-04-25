import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { PerfilResponse } from '../../../../core/models/usuario.interface';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.component.html'
})
export class UsuarioFormComponent implements OnInit {
  form!: FormGroup;
  perfiles: PerfilResponse[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre_usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rut: ['', [Validators.required, Validators.minLength(7)]],
      nombres: ['', Validators.required],
      apellido_paterno: ['', Validators.required],
      apellido_materno: [''],
      id_perfil: [2, Validators.required]
    });

    this.usuarioService.listarPerfiles().subscribe({
      next: (data) => { this.perfiles = data; },
      error: () => { this.perfiles = []; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const value = this.form.value;
    const data = {
      nombre_usuario: value.nombre_usuario,
      password: value.password,
      rut: value.rut,
      nombres: value.nombres,
      apellido_paterno: value.apellido_paterno,
      apellido_materno: value.apellido_materno || undefined,
      id_perfil: +value.id_perfil
    };

    this.usuarioService.crear(data).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('Creado', 'Usuario creado correctamente.', 'success');
        this.router.navigate(['/usuarios/list']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'No se pudo crear el usuario.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  get f() { return this.form.controls; }
}
