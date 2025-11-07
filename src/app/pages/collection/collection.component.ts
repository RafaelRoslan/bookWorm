import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { CardBookComponent } from '../../components/card-book/card-book.component';
import { Book, Collection } from '../../models/api.models';
import { CollectionService } from '../../services/collection.service';
import { ListingService } from '../../services/listing.service';
import { SellDialogComponent, SellForm } from '../../components/sell-dialog/sell-dialog.component';

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
  imports: [CommonModule, FormsModule, CardBookComponent, SellDialogComponent],
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

  showAddForm = false;
  addForm = {
    title: '',
    author: '',
    description: '',
    isbn: '',
    image: ''
  };

  
  // estado de edição
  isEditing = false;
  editIndex: number | null = null;
  editForm = {
    _id: '',
    title: '',
    author: '',
    description: '',
    isbn: '',
    image: '' as string | null  // base64 opcional
  };

  sellOpen = false;
  sellBook: CardBookVM | null = null;
  selling = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CollectionService,
    private listing: ListingService
    
  ) {}

  // abrir edição do i-ésimo livro
  startEdit(i: number): void {
    const b = this.books[i];
    this.isEditing = true;
    this.editIndex = i;
    this.editForm = {
      _id: b._id,
      title: b.titulo ?? '',
      author: b.autor ?? '',
      description: '', // se você já tiver no VM, preencha aqui
      isbn: '',        // idem
      image: b.imageUrl ?? null
    };
  }

  // cancelar edição
  cancelEdit(): void {
    this.isEditing = false;
    this.editIndex = null;
    this.editForm = { _id:'', title:'', author:'', description:'', isbn:'', image: null };
  }

  // salvar edição
  submitEditBook(): void {
    if (!this.collection?._id || !this.isEditing || this.editIndex === null) return;
    const cid = this.collection._id;
    const bid = this.editForm._id;

    const payload: any = {
    title: this.editForm.title?.trim() || '',
    author: this.editForm.author?.trim() || '',
    description: this.editForm.description?.trim() || '',
    isbn: this.editForm.isbn?.trim() || ''
  };

  //console.log(payload);


  if (this.editForm.image) payload.image = this.editForm.image;

    this.svc.updateBook(cid, bid, payload).subscribe({
      next: (res) => {
        // Se o back devolver o livro atualizado:
        const updated = res?.book;
        if (updated) {
          // atualiza localmente o VM daquele card
          this.books[this.editIndex!] = this.toCardVM(updated as any);
        } else {
          // ou recarrega tudo
          this.load(cid);
        }
        this.cancelEdit();
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao atualizar livro';
      }
    });
  }

  // trocar capa na edição (reaproveita seu compressor)
  onEditImageSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = 200 * 1024;
    const maxWidth = 600;

    this.readAndCompressImage(file, maxWidth, maxBytes)
      .then(base64 => this.editForm.image = base64)
      .catch(err => {
        console.error(err);
        this.error = 'Não foi possível processar a nova imagem.';
      });
  }

  openSell(book: CardBookVM) {
    this.sellBook = book;
    this.sellOpen = true;
    // opcional: travar scroll do body
    document.body.style.overflow = 'hidden';
  }

  closeSell() {
    this.sellOpen = false;
    this.sellBook = null;
    document.body.style.overflow = ''; // libera scroll
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



  private sub = new Subscription();

  

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

  private saveTitle(): void {
  if (!this.collection) return;
  const { _id, name } = this.collection;
  if (!_id || !name?.trim()) return;

  this.saving = true;
  const s = this.svc.updateCollection(_id, { name: name.trim() }).subscribe({
    next: (updated) => {
      if (updated && (updated as any).name) {
        this.collection = updated;       // 👈 aplica o nome retornado
      } else {
        this.load(_id);                  // 👈 fallback (se necessário)
      }
      this.editMode = false;             // 👈 sai do modo edição
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

   addBookToggle(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetAddForm();
    }
  }

  private resetAddForm() {
    this.addForm = { title: '', author: '', description: '', isbn: '', image: '' };
  }

  submitAddBook(): void {
    if (!this.collection?._id) return;

    const title = this.addForm.title?.trim();
    if (!title) {
      this.error = 'Informe ao menos o título';
      return;
    }

    const payload = {
      title,
      author: this.addForm.author?.trim() || '',
      description: this.addForm.description?.trim() || '',
      isbn: this.addForm.isbn?.trim() || '',
      image: this.addForm.image?.trim() || ''
    };

    this.svc.addBookToCollection(this.collection._id, payload).subscribe({
      next: () => {
        this.resetAddForm();
        this.showAddForm = false;
        this.load(this.collection!._id); // recarrega lista de livros
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao adicionar livro';
      }
    });
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
  }

  onImageSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = 200 * 1024; // 200KB alvo
    const maxWidth = 600;        // limite de largura

    this.readAndCompressImage(file, maxWidth, maxBytes).then((base64) => {
      this.addForm.image = base64; // salva no form
    }).catch(err => {
      console.error(err);
      this.error = 'Não foi possível processar a imagem.';
    });
  }

  /** Lê arquivo, redimensiona mantendo proporção e tenta ficar <= maxBytes */
  private readAndCompressImage(file: File, maxWidth: number, maxBytes: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject('Arquivo não é imagem');

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          try {
            const base64 = await this.toCompressedDataURL(img, file.type, maxWidth, maxBytes);
            resolve(base64);
          } catch (e) { reject(e); }
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Redimensiona e ajusta qualidade para tentar ficar no teto de bytes */
  private toCompressedDataURL(img: HTMLImageElement, mime: string, maxWidth: number, maxBytes: number): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      // Tenta qualidade adaptativa (apenas para formatos com qualidade: jpeg/webp)
      const supportsQuality = /jpeg|jpg|webp/i.test(mime);
      let quality = supportsQuality ? 0.85 : 1.0;

      const toSize = (b64: string) => {
        // estima bytes de base64 (descontando prefixo data:)
        const pure = b64.split(',')[1] || '';
        return Math.floor((pure.length * 3) / 4);
      };

      let dataUrl = canvas.toDataURL(supportsQuality ? 'image/jpeg' : mime, quality);
      let bytes = toSize(dataUrl);

      // se ainda passou do teto, baixa a qualidade em passos
      while (bytes > maxBytes && supportsQuality && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        bytes = toSize(dataUrl);
      }

      // fallback: se ainda ficou grande demais, reduz mais a largura
      if (bytes > maxBytes && w > 320) {
        const newMax = Math.max(320, Math.floor(w * 0.8));
        resolve(this.toCompressedDataURL(img, mime, newMax, maxBytes)); // recursivo
        return;
      }

      resolve(dataUrl);
    });
  }

  setAsCover(index: number): void {
      if (!this.collection?._id) return;
      const cid = this.collection._id;
      const bid = this.books[index]._id;

      this.svc.setBookAsCover(cid, bid).subscribe({
        next: () => {
          // opcional: feedback na UI
          // se quiser refletir na Bookcase, basta recarregar lá quando voltar para a lista
          alert('Capa definida!');
        },
        error: (e) => {
          console.error(e);
          this.error = e?.error?.message || 'Falha ao definir capa';
        }
      });
  }



};



  


