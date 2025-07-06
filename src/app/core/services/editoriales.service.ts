import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment'

@Injectable({
  providedIn: 'root'
})
export class EditorialesService {
  private apiUrl = environment.apiUrl + 'editoriales/';

  constructor(private http: HttpClient) { }

  getEditoriales(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createEditorial(editorial: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, editorial);
  }

  updateEditorial(editorialId: any, editorial: any): Observable<any> {
    return this.http.put(this.apiUrl + `${editorialId}/`, editorial);
  }

  getEditorial(editorialId: any, editorial: any): Observable<any> {
    return this.http.get(this.apiUrl + `${editorialId}/`, editorial);
  }

  deleteEditorial(editorialId: any): Observable<any> {
    return this.http.delete(this.apiUrl + `${editorialId}/`);
  }
}
