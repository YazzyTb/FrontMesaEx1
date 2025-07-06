import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment'

@Injectable({
  providedIn: 'root'
})
export class AutoresService {
  private apiUrl = environment.apiUrl + 'autores/';

  constructor(private http: HttpClient) { }

  getAutores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createAutor(autor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, autor);
  }

  updateAutor(autorId: any, autor: any): Observable<any> {
    return this.http.put(this.apiUrl + `${autorId}/`, autor);
  }

  getAutor(autorId: any, autor: any): Observable<any> {
    return this.http.get(this.apiUrl + `${autorId}/`, autor);
  }

  deleteAutor(autorId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${autorId}/`);
  }
}
