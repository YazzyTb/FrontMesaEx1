import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetallesService {
  private apiUrl = environment.apiUrl + 'detalles/';

  constructor(private http: HttpClient) { }

  getDetalles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createDetalle(detalle: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, detalle);
  }

  updateDetalle(detalleId: any, detalle: any): Observable<any> {
    return this.http.put(this.apiUrl + `${detalleId}/`, detalle);
  }

  getDetalle(detalleId: any, detalle: any): Observable<any> {
    return this.http.get(this.apiUrl + `${detalleId}/`, detalle);
  }

  deleteDetalle(detalleId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${detalleId}/`);
  }
}
