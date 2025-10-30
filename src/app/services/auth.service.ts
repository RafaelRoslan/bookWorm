import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/api.models';

type LoginDto = { email: string; password: string };
type LoginRes = { token: string };
type MeRes = User;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private userSub = new BehaviorSubject<User | null>(null);
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient) {}

  get token() { return localStorage.getItem('bw_token'); }
  isAuthenticated() { return !!this.token; }

  // BACK: POST /login
  onLogin(dto: LoginDto) {
  return this.http.post<LoginRes>(`${this.api}/login`, dto).pipe(
    
    tap(res => {
      const token = (res as any)?.token;
      if (!token) throw new Error('Resposta do login não contém token');
      localStorage.setItem('bw_token', token);
    }),
    
  );
}
  
  logout() {
    localStorage.removeItem('bw_token');
    this.userSub.next(null);
  }
}

