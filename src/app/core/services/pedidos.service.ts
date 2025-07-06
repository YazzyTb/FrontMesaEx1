import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = environment.apiUrl + 'pedidos/';

  constructor(private http: HttpClient) { }

  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPedido(pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pedido);
  }

  updatePedido(pedidoId: any, pedido: any): Observable<any> {
    return this.http.put(this.apiUrl + `${pedidoId}/`, pedido);
  }

  getPedido(pedidoId: any, pedido: any): Observable<any> {
    return this.http.get(this.apiUrl + `${pedidoId}/`, pedido);
  }

  deletePedido(pedidoId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${pedidoId}/`);
  }

  calcularPedido(pedidoId: any, pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + `${pedidoId}/calcular-total/`, pedido);
  }

  calificarPedido(pedidoId: any, pedido: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + `${pedidoId}/calificar/`, pedido);
  }
}
