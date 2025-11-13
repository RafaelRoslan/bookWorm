import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export type RatingDto = {
  ratedUserId: string;
  negotiationId: string;
  ratingValue: number; // 1-5
  comment?: string;
};

export type UpdateRatingDto = {
  comment?: string;
  ratingValue?: number; // 1-5
};

export type Rating = {
  _id?: string;
  id?: string;
  ratedUserId: string | {
    _id?: string;
    name?: string;
    lastname?: string;
    email?: string;
    status?: string;
  };
  ratingUserId?: string | {
    _id?: string;
    name?: string;
    lastname?: string;
    email?: string;
    status?: string;
    address?: {
      cidade?: string;
      estado?: string;
    };
    type?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  negotiationId?: string | any;
  ratingValue: number;
  comment?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  rater?: {
    _id?: string;
    id?: string;
    name?: string;
    lastname?: string;
  };
  rated?: {
    _id?: string;
    id?: string;
    name?: string;
    lastname?: string;
  };
};

@Injectable({ providedIn: 'root' })
export class RatingService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // POST /ratings — Criar avaliação
  // O ratedUserId é obtido automaticamente do token de autenticação
  createRating(body: Omit<RatingDto, 'ratedUserId'> & { ratedUserId?: string }): Observable<{ message: string; rating?: Rating }> {
    return this.http.post<{ message: string; rating?: Rating }>(`${this.api}/ratings`, body);
  }

  // GET /ratings/user/:userId — Listar avaliações de um usuário
  getUserRatings(userId: string): Observable<Rating[]> {
    return this.http.get<Rating[] | { ratings: Rating[] }>(`${this.api}/ratings/user/${userId}`).pipe(
      map(res => Array.isArray(res) ? res : (res?.ratings ?? []))
    );
  }

  // GET /ratings/negotiation/:negotiationId — Listar avaliações de uma negociação
  getNegotiationRatings(negotiationId: string): Observable<Rating[]> {
    return this.http.get<Rating[] | { ratings: Rating[] }>(`${this.api}/ratings/negotiation/${negotiationId}`).pipe(
      map(res => Array.isArray(res) ? res : (res?.ratings ?? []))
    );
  }

  // PUT /ratings/:ratingId — Atualizar avaliação
  // Pelo menos um campo deve ser informado
  updateRating(ratingId: string, body: UpdateRatingDto): Observable<{ message: string; rating?: Rating }> {
    return this.http.put<{ message: string; rating?: Rating }>(`${this.api}/ratings/${ratingId}`, body);
  }

  // DELETE /ratings/:ratingId — Deletar avaliação
  deleteRating(ratingId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/ratings/${ratingId}`);
  }
}

