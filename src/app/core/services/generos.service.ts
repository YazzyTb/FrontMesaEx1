import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment'

@Injectable({
  providedIn: 'root'
})
export class GenerosService {
  private apiUrl = environment.apiUrl + 'generos/';

  constructor(private http: HttpClient) { }

  getGeneros(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createGenero(genero: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, genero);
  }

  updateGenero(generoId: any, genero: any): Observable<any> {
    return this.http.put(this.apiUrl + `${generoId}/`, genero);
  }

  getGenero(generoId: any, genero: any): Observable<any> {
    return this.http.get(this.apiUrl + `${generoId}/`, genero);
  }

  deleteGenero(generoId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${generoId}/`);
  }
}
