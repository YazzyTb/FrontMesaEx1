import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../core/services/carrito.service';
import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { OfertasService } from '../../core/services/ofertas.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  cantidad: number; // cantidad en el carrito
  ofertaId?: number;
  ofertaNombre?: string;
  ofertaDescuento?: number;
  tieneOferta?: boolean;
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
  ofertas: any[] = []; // Lista de ofertas disponibles

  constructor(
    private carritoService: CarritoService, 
    private detalleCarritoService: DetalleCarritoService, 
    private ofertasService: OfertasService,
    public router: Router
  ) { }

  ngOnInit() {
    this.obtenerCarrito();
    this.cargarOfertas();
  }

  cargarOfertas() {
    this.ofertasService.getOfertasVigentes().subscribe({
      next: (response: any) => {
        this.ofertas = response.ofertas || [];
        this.aplicarOfertasAlCarrito();
      },
      error: (error: any) => {
        console.error('Error al cargar ofertas:', error);
      }
    });
  }

  aplicarOfertasAlCarrito() {
    this.carrito.forEach(detalle => {
      // Primero verificar si el producto tiene ofertas desde las ofertas vigentes cargadas
      const ofertaAplicable = this.ofertas.find(oferta => 
        oferta.productos && oferta.productos.some((p: any) => p.id === detalle.producto.id)
      );
      
      if (ofertaAplicable) {
        detalle.producto.tieneOferta = true;
        detalle.producto.ofertaId = ofertaAplicable.id;
        detalle.producto.ofertaNombre = ofertaAplicable.nombre;
        detalle.producto.ofertaDescuento = ofertaAplicable.descuento;
      } else {
        // También verificar si el producto ya viene con información de oferta del backend
        if (detalle.producto.oferta && detalle.producto.oferta.is_active) {
          detalle.producto.tieneOferta = true;
          detalle.producto.ofertaId = detalle.producto.oferta.id;
          detalle.producto.ofertaNombre = detalle.producto.oferta.nombre;
          detalle.producto.ofertaDescuento = detalle.producto.oferta.descuento;
        } else {
          detalle.producto.tieneOferta = false;
          detalle.producto.ofertaId = null;
          detalle.producto.ofertaNombre = null;
          detalle.producto.ofertaDescuento = null;
        }
      }
    });
  }

  obtenerCarrito() {
    this.carritoService.obtenerCarritoActivo().subscribe({
      next: (resp: any) => {
        console.log('Carrito activo:', resp);
        this.carritoId = resp.id;           // Guarda el ID
        this.carrito = resp.detalles || []; // Asume que viene con los detalles dentro
        this.aplicarOfertasAlCarrito(); // Aplicar ofertas después de cargar el carrito
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

  // Calcular precio de un producto individual con oferta aplicada
  calcularPrecioConOferta(producto: any): number {
    if (producto.tieneOferta && producto.ofertaDescuento) {
      const descuento = parseFloat(producto.ofertaDescuento);
      return Math.max(0, producto.precio - descuento);
    }
    return producto.precio;
  }

  // Calcular ahorro por oferta para un producto
  calcularAhorroProducto(producto: any, cantidad: number): number {
    if (producto.tieneOferta && producto.ofertaDescuento) {
      const descuento = parseFloat(producto.ofertaDescuento);
      return descuento * cantidad;
    }
    return 0;
  }

  // Formatear descuento como moneda
  formatearDescuento(descuento: string | number): string {
    const valor = typeof descuento === 'string' ? parseFloat(descuento) : descuento;
    return `Bs ${valor.toFixed(2)}`;
  }

  get subtotal() {
    return this.carrito.reduce((sum, d) => {
      const precioConOferta = this.calcularPrecioConOferta(d.producto);
      return sum + precioConOferta * d.cantidad;
    }, 0);
  }

  get subtotalSinOfertas() {
    return this.carrito.reduce((sum, d) => sum + d.producto.precio * d.cantidad, 0);
  }

  get totalDescuentosOfertas() {
    return this.carrito.reduce((sum, d) => {
      return sum + this.calcularAhorroProducto(d.producto, d.cantidad);
    }, 0);
  }

  get descuento() {
    return this.totalDescuentosOfertas; // Ahora el descuento viene de las ofertas
  }

  get total() {
    return this.subtotalSinOfertas - this.descuento;
  }

  redirigirAPago() {
    if (!this.carritoId) {
      console.error('No se encontró el ID del carrito.');
      return;
    }
    this.router.navigate(['/pago', this.carritoId]);
  }
}