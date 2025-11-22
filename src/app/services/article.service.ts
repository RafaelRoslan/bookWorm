import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Article, ArticleType } from '../models/api.models';

interface ArticleListResponse {
  articles: any[];
}

interface ArticleResponse {
  article: any;
}

// payloads para criar/editar
export interface ArticlePayload {
  title: string;
  type: ArticleType;
  summary: string;
  content: string[];
  bannerImage?: string;
  authorName: string;
  authorBio?: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  publishedAt?: string; // opcional, back pode usar default
}

export interface ArticleQueryParams {
  q?: string;
  type?: ArticleType;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly baseUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  private mapArticle(dto: any): Article {
    const id = dto.id ?? dto._id ?? '';
    
    return {
      id,
      title: dto.title,
      type: dto.type,
      summary: dto.summary,
      content: dto.content ?? [],
      bannerImage: dto.bannerImage,
      authorName: dto.authorName,
      authorId: dto.authorId,
      authorBio: dto.authorBio,
      publishedAt: dto.publishedAt ?? dto.createdAt,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  getArticles(params?: ArticleQueryParams): Observable<Article[]> {
    let httpParams = new HttpParams();

    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.type) httpParams = httpParams.set('type', params.type);

    return this.http
      .get<ArticleListResponse>(this.baseUrl, { params: httpParams })
      .pipe(map(res => res.articles.map(a => this.mapArticle(a))));
  }

  getArticleById(id: string): Observable<Article> {
    return this.http
      .get<ArticleResponse>(`${this.baseUrl}/${id}`)
      .pipe(map(res => this.mapArticle(res.article)));
  }

  createArticle(payload: ArticlePayload): Observable<Article> {
    return this.http
      .post<{ message: string; article: any }>(this.baseUrl, payload)
      .pipe(map(res => this.mapArticle(res.article)));
  }

  updateArticle(id: string, payload: ArticlePayload): Observable<Article> {
    return this.http
      .put<{ message: string; article: any }>(`${this.baseUrl}/${id}`, payload)
      .pipe(map(res => this.mapArticle(res.article)));
  }

  deleteArticle(id: string): Observable<void> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(map(() => void 0));
  }
}
