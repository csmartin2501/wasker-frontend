import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Cliente } from '../../../../core/models/cliente.interface';
import { ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.error = null;
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar clientes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editCliente(id: number): void {
    this.router.navigate(['/clients/form', id]);
  }

  deleteCliente(cliente: Cliente): void {
    Swal.fire({
      title: '¿Eliminar cliente?',
      text: `Se eliminará a ${cliente.nombre_completo || cliente.nombres}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.clienteService.deleteCliente(cliente.id_cliente).subscribe({
          next: () => {
            this.clientes = this.clientes.filter(c => c.id_cliente !== cliente.id_cliente);
            Swal.fire('Eliminado', 'Cliente eliminado correctamente.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error')
        });
      }
    });
  }

  trackById(_: number, c: Cliente): number {
    return c.id_cliente;
  }
}
