import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiUrl;   //url del back

  constructor(private http: HttpClient) {

  }

  getRoles(): Observable<any> {
    return this.http.get(this.apiUrl + "roles/");
  }
}