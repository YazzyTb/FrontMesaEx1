import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

// Interfaces para las ofertas
export interface Oferta {
  id: number;
  nombre: string;
  descripcion: string;
  descuento: string;
  fecha_inicio: string;
  fecha_fin: string;
  is_active: boolean;
  productos_count: number;
  is_vigente: boolean;
}

export interface OfertaDetallada extends Oferta {
  productos: Producto[];
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  stock: number;
  imagen: string;
  precio: string;
  precio_con_descuento: string;
  descuento_aplicado: string;
  tiene_oferta_vigente: boolean;
  is_active: boolean;
  categoria: any;
  genero: any;
  autor: any;
  editorial: any;
  oferta: Oferta | null;
}

export interface OfertasVigentesResponse {
  count: number;
  ofertas: Oferta[];
}

export interface OfertasProximasResponse {
  count: number;
  ofertas: Oferta[];
}

export interface OfertasExpiradasResponse {
  count: number;
  ofertas: Oferta[];
}

export interface ProductosEnOfertaResponse {
  oferta: {
    id: number;
    nombre: string;
    descuento: string;
  };
  productos_count: number;
  productos: Producto[];
}

export interface AplicarOfertaResponse {
  mensaje: string;
  descuento_aplicado: string;
  precio_original: string;
  precio_con_descuento: string;
  producto: Producto;
}

export interface QuitarOfertaResponse {
  mensaje: string;
  descuento_removido: string;
  precio_actual: string;
  producto: Producto;
}

export interface AgregarProductosResponse {
  mensaje: string;
  oferta_id: number;
  oferta_nombre: string;
  productos_solicitados: number;
  productos_encontrados: number;
  productos_actualizados: number;
  descuento_aplicado: string;
}

export interface QuitarProductosResponse {
  mensaje: string;
  oferta_id: number;
  oferta_nombre: string;
  productos_solicitados: number;
  productos_encontrados: number;
  productos_actualizados: number;
  descuento_removido: string;
}

export interface DesactivarOfertaResponse {
  mensaje: string;
  oferta_id: number;
  oferta_nombre: string;
  productos_afectados: number;
  nota: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfertasService {
  private apiUrl = `${environment.apiUrl}ofertas/`;
  private productosUrl = `${environment.apiUrl}productos/`;

  constructor(private http: HttpClient) { }

  // ==================== CRUD BÁSICO DE OFERTAS ====================

  /**
   * Obtiene todas las ofertas activas
   * GET /ofertas/
   */
  getOfertas(): Observable<Oferta[]> {
    return this.http.get<Oferta[]>(this.apiUrl);
  }

  /**
   * Obtiene una oferta específica con productos incluidos
   * GET /ofertas/{id}/
   */
  getOferta(id: number): Observable<OfertaDetallada> {
    return this.http.get<OfertaDetallada>(`${this.apiUrl}${id}/`);
  }

  /**
   * Crea una nueva oferta
   * POST /ofertas/
   */
  crearOferta(oferta: Partial<Oferta>): Observable<Oferta> {
    return this.http.post<Oferta>(this.apiUrl, oferta);
  }

  /**
   * Actualiza una oferta existente
   * PUT /ofertas/{id}/
   */
  actualizarOferta(id: number, oferta: Partial<Oferta>): Observable<Oferta> {
    return this.http.put<Oferta>(`${this.apiUrl}${id}/`, oferta);
  }

  /**
   * Actualización parcial de una oferta
   * PATCH /ofertas/{id}/
   */
  actualizarOfertaParcial(id: number, campos: Partial<Oferta>): Observable<Oferta> {
    return this.http.patch<Oferta>(`${this.apiUrl}${id}/`, campos);
  }

  /**
   * Desactiva una oferta (eliminación lógica)
   * DELETE /ofertas/{id}/
   */
  desactivarOferta(id: number): Observable<DesactivarOfertaResponse> {
    return this.http.delete<DesactivarOfertaResponse>(`${this.apiUrl}${id}/`);
  }

  // ==================== ENDPOINTS ESPECIALES DE OFERTAS ====================

  /**
   * Obtiene todas las ofertas vigentes (activas y dentro del rango de fechas)
   * GET /ofertas/vigentes/
   */
  getOfertasVigentes(): Observable<OfertasVigentesResponse> {
    return this.http.get<OfertasVigentesResponse>(`${this.apiUrl}vigentes/`);
  }

  /**
   * Obtiene ofertas que comenzarán próximamente
   * GET /ofertas/proximas/
   */
  getOfertasProximas(): Observable<OfertasProximasResponse> {
    return this.http.get<OfertasProximasResponse>(`${this.apiUrl}proximas/`);
  }

  /**
   * Obtiene ofertas que ya han expirado
   * GET /ofertas/expiradas/
   */
  getOfertasExpiradas(): Observable<OfertasExpiradasResponse> {
    return this.http.get<OfertasExpiradasResponse>(`${this.apiUrl}expiradas/`);
  }

  /**
   * Obtiene todos los productos asociados a una oferta específica
   * GET /ofertas/{oferta_id}/productos/
   */
  getProductosEnOferta(ofertaId: number): Observable<ProductosEnOfertaResponse> {
    return this.http.get<ProductosEnOfertaResponse>(`${this.apiUrl}${ofertaId}/productos/`);
  }

  /**
   * Agrega múltiples productos a una oferta de una sola vez
   * POST /ofertas/{oferta_id}/agregar-productos/
   * @param ofertaId ID de la oferta
   * @param productosIds Array de IDs de productos a agregar
   */
  agregarProductosAOferta(ofertaId: number, productosIds: number[]): Observable<AgregarProductosResponse> {
    const body = { productos_ids: productosIds };
    return this.http.post<AgregarProductosResponse>(`${this.apiUrl}${ofertaId}/agregar-productos/`, body);
  }

  /**
   * Quita múltiples productos de una oferta de una sola vez
   * POST /ofertas/{oferta_id}/quitar-productos/
   * @param ofertaId ID de la oferta
   * @param productosIds Array de IDs de productos a quitar
   */
  quitarProductosDeOferta(ofertaId: number, productosIds: number[]): Observable<QuitarProductosResponse> {
    const body = { productos_ids: productosIds };
    return this.http.post<QuitarProductosResponse>(`${this.apiUrl}${ofertaId}/quitar-productos/`, body);
  }

  // ==================== ENDPOINTS DE PRODUCTOS CON OFERTAS ====================

  /**
   * Obtiene todos los productos que tienen ofertas vigentes
   * GET /productos/en-oferta/
   */
  getProductosConOfertas(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.productosUrl}en-oferta/`);
  }

  /**
   * Aplica una oferta específica a un producto
   * POST /productos/{producto_id}/aplicar-oferta/{oferta_id}/
   * @param productoId ID del producto
   * @param ofertaId ID de la oferta a aplicar
   */
  aplicarOfertaAProducto(productoId: number, ofertaId: number): Observable<AplicarOfertaResponse> {
    return this.http.post<AplicarOfertaResponse>(`${this.productosUrl}${productoId}/aplicar-oferta/${ofertaId}/`, {});
  }

  /**
   * Quita la oferta de un producto
   * DELETE /productos/{producto_id}/quitar-oferta/
   * @param productoId ID del producto
   */
  quitarOfertaDeProducto(productoId: number): Observable<QuitarOfertaResponse> {
    return this.http.delete<QuitarOfertaResponse>(`${this.productosUrl}${productoId}/quitar-oferta/`);
  }

  // ==================== MÉTODOS DE UTILIDAD ====================

  /**
   * Verifica si una oferta está vigente basándose en las fechas
   * @param oferta La oferta a verificar
   * @returns true si la oferta está vigente
   */
  esOfertaVigente(oferta: Oferta): boolean {
    const now = new Date();
    const fechaInicio = new Date(oferta.fecha_inicio);
    const fechaFin = new Date(oferta.fecha_fin);
    
    return oferta.is_active && now >= fechaInicio && now <= fechaFin;
  }

  /**
   * Formatea el descuento para mostrar
   * @param descuento El descuento como string
   * @returns El descuento formateado
   */
  formatearDescuento(descuento: string): string {
    return `${parseFloat(descuento).toFixed(0)}%`;
  }

  /**
   * Calcula los días restantes para que expire una oferta
   * @param fechaFin Fecha de fin de la oferta
   * @returns Número de días restantes
   */
  diasRestantesOferta(fechaFin: string): number {
    const now = new Date();
    const fechaExpiracion = new Date(fechaFin);
    const diferencia = fechaExpiracion.getTime() - now.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Obtiene el estado de una oferta
   * @param oferta La oferta a evaluar
   * @returns 'vigente' | 'proxima' | 'expirada' | 'inactiva'
   */
  getEstadoOferta(oferta: Oferta): 'vigente' | 'proxima' | 'expirada' | 'inactiva' {
    if (!oferta.is_active) return 'inactiva';
    
    const now = new Date();
    const fechaInicio = new Date(oferta.fecha_inicio);
    const fechaFin = new Date(oferta.fecha_fin);
    
    if (now < fechaInicio) return 'proxima';
    if (now > fechaFin) return 'expirada';
    return 'vigente';
  }

  /**
   * Calcula el ahorro para un producto con oferta
   * @param precioOriginal Precio sin descuento
   * @param precioConDescuento Precio con descuento aplicado
   * @returns El ahorro en valor absoluto
   */
  calcularAhorro(precioOriginal: string, precioConDescuento: string): number {
    const original = parseFloat(precioOriginal);
    const conDescuento = parseFloat(precioConDescuento);
    return original - conDescuento;
  }
}
