import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;   //url del back

  constructor(private http: HttpClient) {

  }

  registerUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl + "usuarios/", user);
  }

  registrarCliente(user: any) {
    return this.http.post(this.apiUrl + "usuarios/crear-cliente/", user);
  }

  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl + "usuarios/");
  }

  updateUser(userId: any, user: any): Observable<any> {
    return this.http.put(this.apiUrl + `usuarios/${userId}/`, user);
  }

  getUser(userId: any, user: any): Observable<any> {
    return this.http.get(this.apiUrl + `usuarios/${userId}/`, user);
  }

  deleteUser(userId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `usuarios/${userId}/`);
  }
}
