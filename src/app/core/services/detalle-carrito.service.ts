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
   * Disminuye la cantidad de un producto o lo elimina si llega a 0
   * @param detalleId ID del detalle del carrito
   */
  eliminarUnidadProducto(detalleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${detalleId}/eliminar-producto/`).pipe(
      tap({
        error: (err) => console.error('Error al eliminar una unidad del producto:', err)
      })
    );
  }

  /**
   * Elimina completamente un producto del carrito (todas las unidades)
   * @param detalleId ID del detalle del carrito
   */
  eliminarProductoPorCompleto(detalleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${detalleId}/`).pipe(
      tap({
        error: (err) => console.error('Error al eliminar completamente el producto del carrito:', err)
      })
    );
  }
}
