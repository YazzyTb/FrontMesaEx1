import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

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

  carrito$ = this.carritoSubject.asObservable();

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
    return this.http.get(`${this.apiUrl}activo/`).pipe(
      tap({
        error: (err) => console.error('Error al obtener carrito activo:', err)
      })
    );
  }

  convertirPedido(carritoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}${carritoId}/convertir-a-pedido/`, carritoId).pipe(
      tap({
        error: (err) => console.error('Error al convertir el carrito:', err)
      })
    );
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
