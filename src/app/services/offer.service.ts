import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Offer } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(params?: { search?: string; sort?: 'recent'|'price'|'rating'; sellerId?: string }): Observable<Offer[]> {
    let p = new HttpParams();
    if (params?.search)  p = p.set('search', params.search);
    if (params?.sort)    p = p.set('sort', params.sort);
    if (params?.sellerId)p = p.set('sellerId', params.sellerId);
    return this.http.get<Offer[]>(`${this.api}/offers`, { params: p });
  }

  listByBook(bookId: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.api}/books/${bookId}/offers`);
  }
}
