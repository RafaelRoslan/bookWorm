// src/app/services/user.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = environment.apiUrl; // ex.: http://localhost:3001

  constructor(private http: HttpClient) {}

  // CADASTRO (signup)
  createUser(payload: any): Observable<{ message: string; user: any }> {
    return this.http.post<{ message: string; user: any }>(
      `${this.api}/users`,
      payload
    );
  }

  // === ROTAS POR ID (se precisar em outras telas) ===

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/users/${id}`);
  }

  updateUser(id: string, updates: any): Observable<any> {
    return this.http.patch<any>(`${this.api}/users/${id}`, updates);
  }

  deleteUser(id: string): Observable<any> {
    // seu back está com PATCH /users/:id/delete
    return this.http.patch<any>(`${this.api}/users/${id}/delete`, {});
    // se fosse DELETE /users/:id:
    // return this.http.delete<any>(`${this.api}/users/${id}`);
  }

  // === PERFIL DO USUÁRIO LOGADO (usa req.userId no back) ===

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.api}/users/me`);
  }

  updateMyProfile(updates: any): Observable<any> {
    return this.http.patch<any>(`${this.api}/users/me`, updates);
  }
}
