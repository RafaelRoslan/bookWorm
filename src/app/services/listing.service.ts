import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type Listing = {
  _id: string;
  bookId: string;
  sellerId: string;
  bookSnapshot: { title: string; author: string; image?: string; isbn?: string };
  price: number;
  condition: 'novo'|'como_novo'|'bom'|'regular'|'danificado';
  stock: number;
  shipping: 'retirada'|'correios'|'combinado';
  status: 'ativo'|'pausado'|'vendido'|'expirado'|'removido';
  expiresAt: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class ListingService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getListings(opts: { q?: string; minPrice?: number; maxPrice?: number; page?: number; pageSize?: number; sort?: string } = {}) {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => { if (v != null && v !== '') params = params.set(k, String(v)); });
    return this.http.get<{ items: Listing[]; total: number; page: number; pageSize: number }>(`${this.api}/listings`, { params });
  }

  getMyListings() {
    return this.http.get<{ items: Listing[] }>(`${this.api}/listings/mine`);
  }

  createListing(dto: { bookId: string; price: number; condition?: Listing['condition']; stock?: number; shipping?: Listing['shipping'] }) {
    return this.http.post<{ message: string; listing: Listing }>(`${this.api}/listings`, dto);
  }

  updateListing(id: string, dto: Partial<Pick<Listing, 'price'|'condition'|'stock'|'shipping'>>) {
    return this.http.patch<{ message: string; listing: Listing }>(`${this.api}/listings/${id}`, dto);
  }

  deleteListing(id: string) {
    return this.http.delete<{ message: string }>(`${this.api}/listings/${id}`);
  }

  markStatus(id: string, status: Listing['status']) {
    return this.http.post<{ message: string; listing: Listing }>(`${this.api}/listings/${id}/mark`, { status });
  }
}
