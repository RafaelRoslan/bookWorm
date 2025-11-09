import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Ajuste esta BASE_URL se seu back estiver em outra rota
@Injectable({ providedIn: 'root' })
export class UserService {

private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  createUser(payload: any): Observable<{ message: string; user: any }> {
  return this.http.post<{ message: string; user: any }>(`${this.api}/users`, payload);
}


  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  updateUser(id: string, updates: any): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}`, updates);
  }

  deleteUser(id: string): Observable<any> {
    // se você manteve DELETE /:id
    return this.http.delete<any>(`${this.api}/${id}`);
    // se manteve PATCH /:id/delete:
    // return this.http.patch<any>(`${BASE_URL}/${id}/delete`, {});
  }
}
