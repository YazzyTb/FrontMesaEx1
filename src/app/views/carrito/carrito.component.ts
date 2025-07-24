import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../core/services/carrito.service';
import { DetalleCarritoService } from '../../core/services/detalle-carrito.service';
import { CartResponse, CartDetail } from '../../core/interfaces/cart.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export default class CarritoComponent implements OnInit, OnDestroy {
  carrito: CartDetail[] = [];
  carritoResponse: CartResponse | null = null;
  cargando = false;
  private carritoSubscription?: Subscription;

  constructor(
    private carritoService: CarritoService, 
    private detalleCarritoService: DetalleCarritoService,
    public router: Router
  ) { }

  ngOnInit() {
    this.obtenerCarrito();
    
    // Temporalmente deshabilitado para evitar bucles
    /*
    // Suscribirse a los cambios del carrito
    this.carritoSubscription = this.carritoService.carritoActivo$.subscribe({
      next: (carritoActualizado: CartResponse | null) => {
        if (carritoActualizado && carritoActualizado.id !== this.carritoResponse?.id) {
          console.log('Carrito actualizado automáticamente:', carritoActualizado);
          this.carritoResponse = carritoActualizado;
          
          // Filtrar detalles activos y consolidar duplicados
          // Temporal: si is_active no está disponible, mostrar todos los detalles
          let detallesActivos;
          if (carritoActualizado.detalles.length > 0 && carritoActualizado.detalles[0].is_active !== undefined) {
            detallesActivos = carritoActualizado.detalles.filter(detalle => detalle.is_active);
          } else {
            console.warn('Campo is_active no disponible en suscripción, mostrando todos los detalles');
            detallesActivos = carritoActualizado.detalles;
          }
          this.carrito = this.consolidarProductosDuplicados(detallesActivos);
        }
      },
      error: (error) => {
        console.error('Error en suscripción del carrito:', error);
      }
    });
    */
  }

  ngOnDestroy() {
    // Limpiar suscripciones para evitar memory leaks
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe();
    }
  }

  // Función para consolidar productos duplicados (mismo producto_id)
  consolidarProductosDuplicados(detalles: CartDetail[]): CartDetail[] {
    const consolidados = new Map<number, CartDetail>();
    
    detalles.forEach(detalle => {
      const productoId = detalle.producto.id;
      
      if (consolidados.has(productoId)) {
        // Si ya existe, sumar las cantidades y mantener el resto de datos del primero
        const existente = consolidados.get(productoId)!;
        existente.cantidad += detalle.cantidad;
        
        // Recalcular subtotales
        const precioUnitario = parseFloat(existente.precio_unitario) || 0;
        const subtotalNumerico = precioUnitario * existente.cantidad;
        existente.subtotal = subtotalNumerico.toFixed(2);
        
        if (existente.tiene_oferta) {
          const precioOriginal = parseFloat(existente.precio_original) || 0;
          const subtotalOriginalNumerico = precioOriginal * existente.cantidad;
          existente.subtotal_original = subtotalOriginalNumerico.toFixed(2);
          
          const ahorroNumerico = subtotalOriginalNumerico - subtotalNumerico;
          existente.ahorro_por_oferta = ahorroNumerico.toFixed(2);
        }
      } else {
        // Si no existe, agregar el detalle
        consolidados.set(productoId, { ...detalle });
      }
    });
    
    return Array.from(consolidados.values());
  }

  obtenerCarrito() {
    this.cargando = true;
    this.carritoService.obtenerCarritoActivo().subscribe({
      next: (response: CartResponse) => {
        console.log('Carrito obtenido:', response);
        console.log('Detalles recibidos:', response.detalles);
        console.log('Primer detalle completo:', response.detalles[0]);
        this.carritoResponse = response;
        
        // Filtrar detalles activos y consolidar duplicados
        // Temporal: si is_active no está disponible, mostrar todos los detalles
        let detallesActivos;
        if (response.detalles.length > 0 && response.detalles[0].is_active !== undefined) {
          detallesActivos = response.detalles.filter(detalle => detalle.is_active);
        } else {
          console.warn('Campo is_active no disponible, mostrando todos los detalles');
          detallesActivos = response.detalles;
        }
        console.log('Detalles después del filtro is_active:', detallesActivos);
        this.carrito = this.consolidarProductosDuplicados(detallesActivos);
        
        console.log('Detalles activos filtrados:', detallesActivos.length);
        console.log('Carrito después de consolidar duplicados:', this.carrito.length);
        console.log('Carrito consolidado:', this.carrito);
        console.log('Subtotal calculado:', this.subtotalSinOfertas);
        console.log('Total calculado:', this.total);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al obtener carrito:', error);
        this.carrito = [];
        this.carritoResponse = null;
        this.cargando = false;
        
        if (error.status !== 404) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el carrito',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }

  aumentarCantidad(detalle: CartDetail) {
    const nuevaCantidad = detalle.cantidad + 1;
    this.actualizarCantidad(detalle, nuevaCantidad);
  }

  disminuirCantidad(detalle: CartDetail) {
    if (detalle.cantidad > 1) {
      const nuevaCantidad = detalle.cantidad - 1;
      this.actualizarCantidad(detalle, nuevaCantidad);
    } else {
      Swal.fire({
        icon: 'question',
        title: '¿Eliminar producto?',
        text: 'La cantidad mínima es 1. ¿Deseas eliminar este producto del carrito?',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.eliminarProducto(detalle.id);
        }
      });
    }
  }

  private actualizarCantidad(detalle: CartDetail, nuevaCantidad: number) {
    this.detalleCarritoService.actualizarCantidadDetalle(detalle.id, nuevaCantidad).subscribe({
      next: () => {
        console.log('Cantidad actualizada exitosamente');
        
        // Solo recargar el carrito, no notificar (evitar bucle)
        this.obtenerCarrito();
      },
      error: (error: any) => {
        console.error('Error al actualizar cantidad:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la cantidad',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  eliminarProducto(detalleId: number) {
    if (!this.carritoResponse?.id) {
      console.error('No se encontró el ID del carrito.');
      return;
    }

    // Buscar el producto en el carrito para obtener su ID
    const detalle = this.carrito.find(d => d.id === detalleId);
    if (!detalle) {
      console.error('No se encontró el detalle del producto.');
      return;
    }

    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esto eliminará completamente el producto del carrito',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Intentando eliminar producto:', {
          carritoId: this.carritoResponse!.id,
          productoId: detalle.producto.id,
          detalleId: detalleId,
          detalle: detalle
        });
        
        // Usar el endpoint del carrito en lugar del detalle-carrito
        this.carritoService.eliminarProductoDelCarrito(this.carritoResponse!.id, detalle.producto.id).subscribe({
          next: () => {
            console.log('Producto eliminado exitosamente');
            
            // Solo recargar el carrito, no notificar (evitar bucle)
            this.obtenerCarrito();
            
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El producto fue eliminado del carrito',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar producto:', error);
            
            if (error.status === 404) {
              // El producto ya no existe, recargar carrito
              this.obtenerCarrito();
              Swal.fire({
                icon: 'info',
                title: 'Información',
                text: 'El producto ya no se encuentra en el carrito',
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el producto',
                confirmButtonText: 'OK'
              });
            }
          }
        });
      }
    });
  }

  // Métodos para cálculos con base en la nueva estructura
  calcularPrecioConOferta(detalle: CartDetail): number {
    return parseFloat(detalle.precio_unitario);
  }

  calcularPrecioOriginal(detalle: CartDetail): number {
    return parseFloat(detalle.precio_original);
  }

  calcularAhorroProducto(detalle: CartDetail): number {
    if (detalle.tiene_oferta) {
      return parseFloat(detalle.ahorro_por_oferta) || 0;
    }
    return 0;
  }

  formatearDescuento(descuento: string | number): string {
    const valor = typeof descuento === 'string' ? parseFloat(descuento) : descuento;
    return `Bs ${valor.toFixed(2)}`;
  }

  formatearPrecio(precio: string | number): string {
    const valor = typeof precio === 'string' ? parseFloat(precio) : precio;
    return valor.toFixed(2);
  }

  // Getters para totales - Calculados desde el array carrito
  get subtotalSinOfertas(): number {
    if (!this.carrito || this.carrito.length === 0) return 0;
    
    return this.carrito.reduce((total, detalle) => {
      // Si tiene oferta, usar el precio original, sino usar el precio actual
      const precioBase = detalle.tiene_oferta 
        ? parseFloat(detalle.subtotal_original) || parseFloat(detalle.subtotal) || 0
        : parseFloat(detalle.subtotal) || 0;
      
      return total + precioBase;
    }, 0);
  }

  get totalDescuentosOfertas(): number {
    if (!this.carrito || this.carrito.length === 0) return 0;
    
    return this.carrito.reduce((total, detalle) => {
      if (detalle.tiene_oferta) {
        const ahorro = parseFloat(detalle.ahorro_por_oferta) || 0;
        return total + ahorro;
      }
      return total;
    }, 0);
  }

  get total(): number {
    if (!this.carrito || this.carrito.length === 0) return 0;
    
    // Calcular el total directamente desde los subtotales actuales
    return this.carrito.reduce((total, detalle) => {
      const subtotal = parseFloat(detalle.subtotal) || 0;
      return total + subtotal;
    }, 0);
  }

  get cantidadTotalItems(): number {
    if (!this.carritoResponse) return 0;
    return this.carritoResponse.cantidad_items || 0;
  }

  get cantidadTotalProductos(): number {
    if (!this.carritoResponse) return 0;
    return this.carritoResponse.cantidad_productos || 0;
  }

  redirigirAPago() {
    console.log('Intentando redirigir a pago...');
    
    if (!this.carritoResponse?.id) {
      console.error('No se encontró el ID del carrito.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede proceder al pago. El carrito no está disponible.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.carrito.length === 0) {
      console.warn('El carrito está vacío.');
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'No puedes proceder al pago con un carrito vacío.',
        confirmButtonText: 'OK'
      });
      return;
    }

    console.log('Redirigiendo a pago con carrito ID:', this.carritoResponse.id);
    this.router.navigate(['/pago', this.carritoResponse.id]);
  }

  // Métodos de utilidad para el HTML
  tieneOfertasVigentes(): boolean {
    return this.carrito.some(detalle => detalle.tiene_oferta && this.esOfertaVigente(detalle));
  }

  private esOfertaVigente(detalle: CartDetail): boolean {
    return detalle.oferta_vigente?.['vigente'] === true;
  }

  obtenerEstadoOferta(detalle: CartDetail): string {
    if (!detalle.tiene_oferta) return 'Sin oferta';
    if (this.esOfertaVigente(detalle)) return 'Oferta vigente';
    return 'Oferta expirada';
  }

  calcularPorcentajeDescuento(detalle: CartDetail): number {
    if (!detalle.tiene_oferta) return 0;
    
    const precioOriginal = parseFloat(detalle.precio_original);
    const descuento = parseFloat(detalle.descuento_oferta);
    
    if (precioOriginal === 0) return 0;
    return (descuento / precioOriginal) * 100;
  }

  /**
   * Vacía completamente el carrito
   * Método público para vaciar todos los productos del carrito
   */
  limpiarTodoElCarritos(): void {
    if (!this.carritoResponse?.id) {
      console.error('No se encontró el ID del carrito.');
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Vaciar carrito?',
      text: '¿Estás seguro de que deseas eliminar todos los productos del carrito? Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar carrito',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.detalleCarritoService.eliminarProductoPorCompleto(this.carritoResponse!.id).subscribe({
          next: () => {
            console.log('Carrito vaciado exitosamente');
            
            // Limpiar inmediatamente la UI
            this.carrito = [];
            this.carritoResponse = null;
            
            // Recargar el carrito desde el servidor para sincronizar
            this.obtenerCarrito();
            
            Swal.fire({
              icon: 'success',
              title: 'Carrito vaciado',
              text: 'Todos los productos han sido eliminados del carrito',
              confirmButtonText: 'OK'
            });
          },
          error: (error) => {
            console.error('Error al vaciar el carrito:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo vaciar el carrito. Inténtalo de nuevo.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }
}
