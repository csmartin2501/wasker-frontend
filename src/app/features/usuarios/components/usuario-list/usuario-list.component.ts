import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { UsuarioResponse } from '../../../../core/models/usuario.interface';

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html'
})
export class UsuarioListComponent implements OnInit {
  usuarios: UsuarioResponse[] = [];
  loading = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.usuarioService.listar().subscribe({
      next: (data) => { this.usuarios = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  goToForm(): void {
    this.router.navigate(['/usuarios/form']);
  }

  eliminar(u: UsuarioResponse): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará "${u.nombre_usuario}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminar(u.id_usuario).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Usuario eliminado correctamente.', 'success');
            this.load();
          },
          error: (err) => {
            const msg = err.error?.detail || 'No se pudo eliminar el usuario.';
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }
}
