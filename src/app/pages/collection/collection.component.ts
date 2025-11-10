import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';

import { AddBookDialogComponent, AddBookForm } from '../../components/add-book-dialog/add-book-dialog.component';
import { CardBookComponent } from '../../components/card-book/card-book.component';
import { SellDialogComponent, SellForm } from '../../components/sell-dialog/sell-dialog.component';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Book, Collection } from '../../models/api.models';
import { BookService } from '../../services/book.service';
import { CollectionService } from '../../services/collection.service';
import { ListingService } from '../../services/listing.service';

type CardBookVM = {
  _id: string;
  titulo: string;
  autor?: string;
  ano?: string | number | null;
  publisher?: string | null;
  description?: string | null;
  isbn?: string | null;  
  status?: string | null;
  imageUrl?: string | null;
};

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, CardBookComponent, SellDialogComponent, AddBookDialogComponent, ConfirmDialogComponent],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent implements OnInit, OnDestroy {
  collection: Collection | null = null;
  books: CardBookVM[] = [];

  // estados gerais
  loading = false;
  saving  = false;
  updating = false;
  error   = '';

  // edição título da coleção
  editMode = false;

  // edição de livro
  editOpen = false;
  editInitial: AddBookForm | null = null;
  editingId: string | null = null;

  // remover livro
  confirmRemoveOpen = false;
  confirmRemoveIndex: number | null = null;
  removing = false;

  // modal de venda
  sellOpen = false;
  sellBook: CardBookVM | null = null;
  selling = false;

  // modal de adicionar livro
  addOpen = false;

  // usar como capa (desabilitar/rotular após definido)
  coverBusy = false;
  coveredIds = new Set<string>();

  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CollectionService,
    private svb: BookService,
    private listing: ListingService
  ) {}

  trackById(index: number, item: any): string {
  return item._id;
}


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
    document.body.style.overflow = ''; // garante que o scroll não fique travado
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
        if (updated && (updated as any).name) {
          this.collection = updated;
        } else {
          this.load(_id);
        }
        this.editMode = false;
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


 
  /** --------- VENDER (modal) ---------- */
  openSell(book: CardBookVM) {
    this.sellBook = book;
    this.sellOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeSell() {
    this.sellOpen = false;
    this.sellBook = null;
    document.body.style.overflow = '';
  }

  onSellSubmit(form: SellForm) {
    if (!this.sellBook?._id || this.selling) return;
    this.selling = true;

    this.listing.createListing({
      bookId: this.sellBook._id,
      price: form.price,
      condition: form.condition,
      stock: form.stock,
      shipping: form.shipping
    }).subscribe({
      next: () => { this.selling = false; this.closeSell(); },
      error: (e) => { this.selling = false; this.error = e?.error?.message || 'Falha ao criar anúncio'; }
    });
  }

  /** --------- ADICIONAR LIVRO (modal) ---------- */
  openAdd(): void {
    this.addOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeAdd(): void {
    this.addOpen = false;
    document.body.style.overflow = '';
  }

  onAddSubmit(f: AddBookForm): void {
    if (!this.collection?._id) return;
    const cid = this.collection._id;

    const payload: any = {
      title: f.title,
      author: f.author,
      description: f.description || '',
      isbn: f.isbn || '',
      image: f.image || ''
    };
    // Se year/publisher já existem no back:
    if (f.year != null) payload.year = f.year;
    if (f.publisher) payload.publisher = f.publisher;

    this.svc.addBookToCollection(cid, payload).subscribe({
      next: () => {
        this.closeAdd();
        this.load(cid);
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao adicionar livro';
      }
    });
  }

  /** --------- EDITAR LIVRO (modal) ---------- */
  openEdit(i: number): void {
  if (!this.collection?._id) return;
  const cid = this.collection._id;
  const vm = this.books[i];

  // Busca o livro completo no back
  this.svb.getBook(cid, vm._id).subscribe({
    next: (res: any) => {
      const b = res?.book ?? res; // tanto faz se o service já mapear
      this.editingId = vm._id;
      this.editInitial = {
        title: b.title ?? b.titulo ?? '',
        author: b.author ?? b.autor ?? '',
        description: b.description ?? '',        // 👈 agora vem do back
        isbn: b.isbn ?? '',
        year: b.year ?? b.ano ?? null,
        publisher: b.publisher ?? '',
        image: b.image ?? b.imageUrl ?? b.cover ?? ''
      };
      this.editOpen = true;
      document.body.style.overflow = 'hidden';
    },
    error: (e) => {
      console.error(e);
      this.error = e?.error?.message || 'Não foi possível carregar o livro para edição';
    }
  });
  }


  closeEdit(): void {
    this.editOpen = false;
    this.editInitial = null;
    this.editingId = null;
    this.updating = false;
    document.body.style.overflow = '';
  }

  onEditSubmit(f: AddBookForm): void {
    if (!this.collection?._id || !this.editingId || this.updating) return;
    this.updating = true;
    const cid = this.collection._id;
    const bid = this.editingId;

    // monta payload apenas com o que deve mudar
    const payload: any = {
      title: f.title,
      author: f.author,
      description: f.description || '',
      isbn: f.isbn || ''
    };
    if (typeof f.year !== 'undefined') payload.year = f.year ?? null;
    if (typeof f.publisher !== 'undefined') payload.publisher = f.publisher ?? '';

    // imagem:
    // - '' => limpar
    // - base64 => trocar
    // - undefined => não mexer
    if (f.image === '') payload.image = '';
    else if (typeof f.image === 'string') payload.image = f.image; // base64
    // se undefined, não inclui

    this.svc.updateBook(cid, bid, payload).subscribe({
      next: (res) => {
        const updated = res?.book;
        if (updated) {
          // atualiza o VM local sem recarregar tudo
          const idx = this.books.findIndex(x => x._id === bid);
          if (idx >= 0) this.books[idx] = this.toCardVM(updated as any);
        } else {
          this.load(cid);
        }
        this.updating = false;
        this.closeEdit();
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao atualizar livro';
        this.updating = false;
      }
    });
  }

  /** --------- REMOVER LIVRO (modal) ---------- */
  confirmRemove(i: number){
    this.confirmRemoveIndex = i;
    this.confirmRemoveOpen = true;
    document.body.style.overflow = 'hidden';
  }
  closeConfirmRemove(){
    this.confirmRemoveOpen = false;
    this.confirmRemoveIndex = null;
    document.body.style.overflow = '';
  }
  doRemoveConfirmed(){
    if (this.confirmRemoveIndex == null || !this.collection?._id) return;
    const idx = this.confirmRemoveIndex;
    const book = this.books[idx];
    this.removing = true;

    this.svc.removeBook(this.collection._id, book._id).subscribe({
      next: () => {
        this.books.splice(idx, 1);
        this.removing = false;
        this.closeConfirmRemove();
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao remover o livro';
        this.removing = false;
      }
    });
  }



  /** --------- OUTROS ---------- */
  removeBook(index: number): void {
    const book = this.books[index];
    if (!book || !this.collection?._id) return;
    if (!confirm('Remover este livro?')) return;

    this.svc.removeBook(this.collection._id, book._id).subscribe({
      next: () => this.books.splice(index, 1),
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao remover o livro';
      }
    });
  }

    setAsCover(index: number): void {
    if (!this.collection?._id || this.coverBusy) return;
    const cid = this.collection._id;
    const bid = this.books[index]._id;

    this.coverBusy = true;
    this.svc.setBookAsCover(cid, bid).subscribe({
      next: () => {
        this.coverBusy = false;
        this.coveredIds.add(bid); // marca como já definido
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao definir capa';
        this.coverBusy = false;
      }
    });
  }


  /** Normaliza os campos do back → card-book */
  private toCardVM = (b: Book): CardBookVM => {
    const titulo     = (b as any).titulo     ?? (b as any).title     ?? '';
    const autor      = (b as any).autor      ?? (b as any).author    ?? '';
    const anoRaw     = (b as any).ano        ?? (b as any).year      ?? null;
    const status     = (b as any).status     ?? null;
    const image      = (b as any).imageUrl   ?? (b as any).image     ?? (b as any).cover ?? null;
    const publisher  = (b as any).publisher  ?? null;            // ✅
    const isbn       = (b as any).isbn       ?? null;            // ✅
    const description= (b as any).description?? null;            // ✅

    return {
      _id: (b as any)._id,
      titulo,
      autor,
      ano: anoRaw,
      publisher,
      isbn,
      description,
      status,
      imageUrl: image,
    };
  };

}
