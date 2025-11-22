import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
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
  get currentUser(): User | null { return this.userSub.value; }
  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }


  // BACK: POST /login
  onLogin(dto: LoginDto) {
    return this.http.post<LoginRes>(`${this.api}/login`, dto).pipe(
      tap(res => {
        const token = (res as any)?.token;
        if (!token) throw new Error('Resposta do login não contém token');
        localStorage.setItem('bw_token', token);
      }),
      switchMap(() => this.loadMe())
    );
  }

  loadMe(): Observable<User | null> {
    if (!this.isAuthenticated()) {
      this.userSub.next(null);
      return of(null);
    }

    return this.http.get<Partial<User> & { _id?: string } | { user: Partial<User> & { _id?: string } }>(`${this.api}/users/me`).pipe(
      map(res => {
        const payload = (res && typeof res === 'object' && 'user' in res)
          ? (res as { user: Partial<User> & { _id?: string } }).user
          : (res as Partial<User> & { _id?: string });

        if (!payload) return null;

        const normalized: User = {
          _id: (payload._id as string) ?? (payload._id as string) ?? '',
          name: (payload.name as string) ?? '',
          lastname: (payload.lastname as string) ?? '',
          email: (payload.email as string) ?? '',
          role: (payload as any).role ?? 'user'
        };

        return normalized;
      }),
      tap(user => this.userSub.next(user ?? null))
    );
  }
  
  logout() {
    localStorage.removeItem('bw_token');
    this.userSub.next(null);
  }
}

