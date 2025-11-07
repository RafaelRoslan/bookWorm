import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBook(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.api}/books/${id}`);
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
