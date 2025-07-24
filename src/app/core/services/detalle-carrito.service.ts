import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class DetalleCarritoService {
  private apiUrl = environment.apiUrl + 'detalle-carrito/';

  constructor(private http: HttpClient) { }

  getDetalles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDetalleProducto(detalleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}${detalleId}`);
  }

  /**
   * Verifica si un detalle existe en el carrito
   * @param detalleId ID del detalle del carrito
   */
  verificarDetalleExiste(detalleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${detalleId}/`).pipe(
      tap({
        next: () => console.log(`Detalle ${detalleId} existe`),
        error: (err) => console.log(`Detalle ${detalleId} no existe:`, err.status)
      })
    );
  }
  /**
   * Agrega un producto al carrito (o aumenta cantidad si ya existe)
   * @param detalle { producto_id: number, cantidad: number }
   */
  agregarProducto(detalle: { producto_id: number; cantidad: number }): Observable<any> {
    return this.http.post(this.apiUrl, detalle).pipe(
      tap({
        error: (err) => console.error('Error al agregar el producto al carrito:', err)
      })
    );
  }

  /**
   * Disminuye la cantidad de un producto en 1 unidad
   * Si la cantidad llega a 1, elimina el producto completamente
   * @param detalleId ID del detalle del carrito
   * @param cantidadActual Cantidad actual del producto
   */
  disminuirUnidadProducto(detalleId: number, cantidadActual: number): Observable<any> {
    if (cantidadActual <= 1) {
      // Si solo queda 1 unidad, eliminar completamente
      return this.eliminarProductoPorCompleto(detalleId);
    } else {
      // Si hay más de 1, actualizar a cantidad - 1
      const nuevaCantidad = cantidadActual - 1;
      return this.actualizarCantidadDetalle(detalleId, nuevaCantidad);
    }
  }

  /**
   * Elimina completamente un producto del carrito (todas las unidades)
   * @param detalleId ID del detalle del carrito
   */
  eliminarProductoPorCompleto(detalleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${detalleId}/eliminar-producto/`).pipe(
      tap({
        next: (response) => console.log(`Producto ${detalleId} eliminado exitosamente:`, response),
        error: (err) => {
          console.error(`Error al eliminar producto ${detalleId}:`, err);
          if (err.status === 400 && err.error?.error?.includes('No DetalleCarrito matches')) {
            console.warn(`El producto ${detalleId} ya no existe en el carrito`);
          }
        }
      })
    );
  }

  /**
   * Actualiza la cantidad de un producto específico en el carrito
   * @param detalleId ID del detalle del carrito
   * @param nuevaCantidad Nueva cantidad del producto
   */
  actualizarCantidadDetalle(detalleId: number, nuevaCantidad: number): Observable<any> {
    return this.http.put(`${this.apiUrl}${detalleId}/`, { cantidad: nuevaCantidad }).pipe(
      tap({
        error: (err) => console.error('Error al actualizar cantidad del producto:', err)
      })
    );
  }
}
