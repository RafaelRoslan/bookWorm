import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book } from '../models/api.models';

export type BookDto = {
  _id: string;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  image?: string;         // base64 ou URL
  collectionId: string;
};


@Injectable({ providedIn: 'root' })
export class BookService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBook(collectionId: string, bookId: string): Observable<BookDto> {
    return this.http
      .get<{ book: BookDto }>(`${this.api}/collections/${collectionId}/books/${bookId}`)
      .pipe(map(res => res.book));
  }

  createBook(collectionId: string, body: Partial<Book>) {
    return this.http.post<Book>(`${this.api}/collections/${collectionId}/books`, body);
  }

  updateBook(collectionId: string, bookId: string, body: Partial<Book>) {
    return this.http.patch<Book>(`${this.api}/collections/${collectionId}/books/${bookId}`, body);
  }

  deleteBook(collectionId: string, bookId: string) {
    return this.http.delete<void>(`${this.api}/collections/${collectionId}/books/${bookId}`);
  }

}
