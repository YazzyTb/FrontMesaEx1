import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { CartResponse } from '../interfaces/cart.interface';

interface ProductoCarrito {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  private apiUrl = environment.apiUrl + 'carrito/';
  private carrito: ProductoCarrito[] = [];
  private carritoSubject = new BehaviorSubject<ProductoCarrito[]>([]);
  
  // Nuevo subject para notificar cambios en el carrito activo
  private carritoActivoSubject = new BehaviorSubject<CartResponse | null>(null);

  carrito$ = this.carritoSubject.asObservable();
  carritoActivo$ = this.carritoActivoSubject.asObservable();

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined' && localStorage) {
      const data = localStorage.getItem('carrito');
      if (data) {
        this.carrito = JSON.parse(data);
        this.carritoSubject.next(this.carrito);
      }
    }
  }

  /**
   * Obtiene todos los carritos (activos e inactivos)
   */
  getCarritos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Obtiene un carrito específico por su ID
   * @param carritoId ID del carrito
   */
  obtenerCarrito(carritoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${carritoId}/`);
  }

  obtenerCarritoActivo(): Observable<any> {
    return this.http.get<CartResponse>(`${this.apiUrl}activo/`).pipe(
      tap({
        next: (carrito: CartResponse) => {
          // Notificar a los componentes que el carrito se ha actualizado
          this.carritoActivoSubject.next(carrito);
        },
        error: (err) => {
          console.error('Error al obtener carrito activo:', err);
          this.carritoActivoSubject.next(null);
        }
      })
    );
  }

  /**
   * Método para notificar manualmente que el carrito ha cambiado
   * Útil cuando se agregan productos desde otros servicios
   */
  notificarCambioCarrito(): void {
    this.obtenerCarritoActivo().subscribe({
      next: (carrito) => {
        console.log('Carrito actualizado:', carrito);
      },
      error: (error) => {
        console.error('Error al actualizar carrito:', error);
      }
    });
  }

  convertirPedido(carritoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${carritoId}/convertir-a-pedido/`, carritoId).pipe(
      tap({
        error: (err) => console.error('Error al convertir el carrito:', err)
      })
    );
  }

  /**
   * Elimina un producto específico del carrito
   * @param carritoId ID del carrito
   * @param productoId ID del producto a eliminar
   */
  eliminarProductoDelCarrito(carritoId: number, productoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${carritoId}/eliminar_producto/`, {
      body: { producto_id: productoId }
    });
  }

  /**
   * Elimina completamente el carrito
   * @param carritoId ID del carrito
   */
  eliminarCarrito(carritoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${carritoId}/`);
  }

  /**
   * Vacía todos los productos de un carrito sin eliminar el carrito como tal
   * @param carritoId ID del carrito
   */
  vaciarCarrito(carritoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${carritoId}/vaciar/`);
  }
}
