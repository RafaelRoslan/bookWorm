import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CardBookComponent } from "../../components/card-book/card-book.component";
import { Book, Collection } from '../../models/api.models';
import { CollectionService } from '../../services/collection.service';

type CardBookVM = {
  _id: string;
  titulo: string;
  autor?: string;
  ano?: string | number;
  status?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, CardBookComponent],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent implements OnInit, OnDestroy {
  collection!: Collection;
  books: CardBookVM[] = [];

  editMode = false;
  loading = false;
  saving = false;
  error = '';

  private sub = new Subscription();
  private api = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CollectionService,
    private http: HttpClient // usaremos para deletar livros, já que o método não está no service
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Coleção não informada.';
      // opcional: redirecionar para /bookcase
      // this.router.navigate(['/bookcase']);
      return;
    }
    this.load(id);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /** Carrega coleção + livros */
  private load(collectionId: string): void {
    this.loading = true;
    this.error = '';

    const s = forkJoin({
      col: this.svc.getCollection(collectionId),
      books: this.svc.getBooksOfCollection(collectionId),
    }).subscribe({
      next: ({ col, books }) => {
        this.collection = col;
        this.books = (books ?? []).map(this.toCardVM);
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao carregar a coleção';
        this.loading = false;
      },
    });

    this.sub.add(s);
  }

  /** Alterna modo de edição; ao sair do modo edição, salva o título */
  toggleEditMode(): void {
    if (!this.collection) return;

    // se estava editando e vamos concluir, salva
    if (this.editMode) {
      this.saveTitle();
    }
    this.editMode = !this.editMode;
  }

  /** Salva apenas o nome da coleção */
  private saveTitle(): void {
    const { _id, name } = this.collection;
    if (!_id || !name?.trim()) return;

    this.saving = true;
    const s = this.svc.updateCollection(_id, { name: name.trim() }).subscribe({
      next: (updated) => {
        this.collection = updated;
        this.saving = false;
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao salvar a coleção';
        this.saving = false;
      },
    });
    this.sub.add(s);
  }

  /** Remove um livro (chama DELETE /collections/:collectionId/books/:bookId) */
  removeBook(index: number): void {
    const book = this.books[index];
    if (!book?._id || !this.collection?._id) return;

    if (!confirm('Remover este livro da coleção?')) return;

    const url = `${this.api}/collections/${this.collection._id}/books/${book._id}`;
    const s = this.http.delete<void>(url).subscribe({
      next: () => {
        // remove localmente para refletir na UI sem recarregar tudo
        this.books.splice(index, 1);
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao remover o livro';
      },
    });

    this.sub.add(s);
  }

  /** Adapta o Book do back para o CardBook esperado no template */
  private toCardVM = (b: Book): CardBookVM => {
    // cobrimos nomes alternativos caso o back use outro idioma/campos
    const titulo = (b as any).titulo ?? (b as any).title ?? '';
    const autor = (b as any).autor ?? (b as any).author ?? '';
    const ano = (b as any).ano ?? (b as any).year ?? '';
    const status = (b as any).status ?? '';
    const imageUrl = (b as any).imageUrl ?? (b as any).image ?? (b as any).cover ?? '';

    return {
      _id: (b as any)._id,
      titulo,
      autor,
      ano,
      status,
      imageUrl,
    };
  };
}
