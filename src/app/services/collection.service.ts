import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Collection } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.api}/collections`);
  }

  getCollection(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.api}/collections/${id}`);
  }

  getBooksOfCollection(collectionId: string) {
  return this.http.get<any>(`${this.api}/collections/${collectionId}/books`)
    .pipe(map(res => Array.isArray(res) ? res : (res?.books ?? [])));
  }
  
  createCollection(body: Partial<Collection>) {
    return this.http.post<Collection>(`${this.api}/collections`, body);
  }

  updateCollection(id: string, body: Partial<Collection>) {
    return this.http.patch<Collection>(`${this.api}/collections/${id}`, body);
  }

  deleteCollection(id: string) {
    return this.http.delete<void>(`${this.api}/collections/${id}`);
  }
}
