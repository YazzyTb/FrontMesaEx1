import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from './../../environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl   //url base del backend

  constructor(private http: HttpClient, private router: Router) { }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, user).pipe(
      tap(async (response: any) => {
        if (response.token) {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}