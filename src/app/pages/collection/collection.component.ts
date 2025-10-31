import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { CardBookComponent } from '../../components/card-book/card-book.component';
import { Book, Collection } from '../../models/api.models';
import { CollectionService } from '../../services/collection.service';

type CardBookVM = {
  _id: string;
  titulo: string;
  autor?: string;
  ano?: string | number | null;
  status?: string | null;
  imageUrl?: string | null;
};

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, CardBookComponent],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent implements OnInit, OnDestroy {
  collection: Collection | null=null;
  books: CardBookVM[] = [];

  editMode = false;
  loading = false;
  saving = false;
  error = '';

  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CollectionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Coleção não informada.';
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
        console.log('DEBUG books:', this.books);
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
    if (this.editMode) this.saveTitle();
    this.editMode = !this.editMode;
  }

  /** Salva apenas o nome da coleção */
  private saveTitle(): void {
    if (!this.collection) return;  
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

  /** Remove livro (se quiser ativar o botão “Remover” do seu HTML) */
  removeBook(index: number): void {
    // TODO: implemente quando tiver o endpoint (DELETE /collections/:cid/books/:bid)
    // Por enquanto só remove da UI:
    this.books.splice(index, 1);
  }

  /** Normaliza os campos do back → card-book inputs */
  private toCardVM = (b: Book): CardBookVM => {
    const titulo = (b as any).titulo ?? (b as any).title ?? '';
    const autor  = (b as any).autor  ?? (b as any).author ?? '';
    const anoRaw = (b as any).ano    ?? (b as any).year   ?? null;
    const status = (b as any).status ?? null;
    const image  = (b as any).imageUrl ?? (b as any).image ?? (b as any).cover ?? null;

    return {
      _id: (b as any)._id,
      titulo,
      autor,
      ano: anoRaw,
      status,
      imageUrl: image,
    };
  };
}
