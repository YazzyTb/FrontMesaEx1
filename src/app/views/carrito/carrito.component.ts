import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../core/services/carrito.service';
import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  cantidad: number; // cantidad en el carrito
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export default class CarritoComponent implements OnInit {
  carrito: any[] = [];
  carritoId!: number; // Variable para guardar el ID del carrito
  carritoDetalles: any[] = []; // Lista de detalles
  constructor(private carritoService: CarritoService, private detalleCarritoService: DetalleCarritoService, private router: Router) { }

  ngOnInit() {
    this.obtenerCarrito();
  }

  obtenerCarrito() {
    this.carritoService.obtenerCarritoActivo().subscribe({
      next: (resp: any) => {
        console.log('Carrito activo:', resp);
        this.carritoId = resp.id;           // Guarda el ID
        this.carrito = resp.detalles || []; // Asume que viene con los detalles dentro
      },
      error: (error: any) => {
        console.log('Error al obtener carrito activo:', error);
      }
    });
  }

  aumentarCantidad(detalle: any) {
    console.log('Detalle antes de la actualización:', detalle);
    const nuevaCantidad = 1;
    console.log('Nueva cantidad a enviar:', nuevaCantidad);

    this.detalleCarritoService.agregarProducto({
      producto_id: detalle.producto.id,
      cantidad: nuevaCantidad
    }).subscribe({
      next: () => {
        this.obtenerCarrito(); // Recarga la lista actualizada
      },
      error: (error) => {
        console.error('Error al actualizar cantidad:', error);
      }
    });
  }

  disminuirCantidad(detalle: any) {
    console.log('Detalle antes de la actualización:', detalle);
    if (detalle.cantidad > 1) {
      const nuevaCantidad = 1;
      this.detalleCarritoService.agregarProducto({
        producto_id: detalle.producto.id,
        cantidad: nuevaCantidad
      }).subscribe({
        next: () => {
          this.obtenerCarrito(); // Recarga la lista actualizada
        },
        error: (error) => {
          console.error('Error al actualizar cantidad:', error);
        }
      });
    } else {
      console.log('No se puede disminuir más la cantidad, producto con cantidad mínima de 1');
    }
  }

  eliminarProducto(detalleId: number) {
    this.detalleCarritoService.eliminarUnidadProducto(detalleId).subscribe({
      next: () => {
        this.obtenerCarrito(); // Vuelve a cargar el carrito para reflejar los cambios
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
      }
    });
  }

  get subtotal() {
    return this.carrito.reduce((sum, d) => sum + d.producto.precio * d.cantidad, 0);
  }

  get descuento() {
    return 5; // Lógica de descuento si aplica
  }

  get total() {
    return this.subtotal - this.descuento;
  }

  redirigirAPago() {
    if (!this.carritoId) {
      console.error('No se encontró el ID del carrito.');
      return;
    }
    this.router.navigate(['/pago', this.carritoId]);
  }
}