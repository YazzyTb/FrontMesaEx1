import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service'; // Ajusta la ruta
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css'
})
export default class PagoComponent {
  tarjeta = '';
  expiracion = '';
  cvv = '';
  cargando = false;
  error = '';
  exito = false;
  carritoId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carritoService: CarritoService
  ) {
    this.carritoId = +this.route.snapshot.paramMap.get('id')!;
  }

  pagar() {
    if (!this.tarjeta || !this.expiracion || !this.cvv) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }

    this.cargando = true;
    this.error = '';

    setTimeout(() => {
      this.convertirCarritoEnPedido();
    }, 2000);
  }

  convertirCarritoEnPedido(): void {
    this.carritoService.convertirPedido(this.carritoId).subscribe({
      next: (response) => {
        this.cargando = false;
        this.exito = true;

        Swal.fire({
          position: "center",
          icon: "success",
          title: "¡Pago exitoso y pedido generado!",
          showConfirmButton: false,
          timer: 2500
        });

        setTimeout(() => {
          this.router.navigate(['/catalogo']); // Redirige a inicio o historial
        }, 2500);
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al convertir el carrito en pedido:', error);
        this.error = 'No se pudo procesar el pago. Intenta nuevamente.';
      }
    });
  }
}
