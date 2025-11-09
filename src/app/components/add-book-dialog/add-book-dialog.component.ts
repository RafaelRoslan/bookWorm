import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type AddBookForm = {
  title: string;
  author: string;
  year?: number | null;
  publisher?: string;
  description?: string;
  isbn?: string;
  image?: string | null; // base64 data URL | '' para limpar | undefined para "não mexer"
};
@Component({
  selector: 'app-add-book-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-book-dialog.component.html',
  styleUrl: './add-book-dialog.component.css'
})


export class AddBookDialogComponent implements OnChanges {
  @Input() dialogTitle = 'Adicionar livro';
  @Input() submitLabel = 'Salvar';

  /** Quando passado, o modal carrega em modo “edição” */
  @Input() initial: AddBookForm | null = null;

  /** Se true, mostra um checkbox “limpar capa” (útil na edição) */
  @Input() canClearImage = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<AddBookForm>();

  // estado do form
  form: AddBookForm = {
    title: '',
    author: '',
    year: null,
    publisher: '',
    description: '',
    isbn: '',
    image: ''
  };

  // controle de “limpar capa” (edição)
  clearImage = false;

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(e: KeyboardEvent | Event) { e.preventDefault(); }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['initial']) {
      const v = this.initial ?? null;
      if (v) {
        // clona para não mutar o objeto vindo de fora
        this.form = {
          title: v.title ?? '',
          author: v.author ?? '',
          year: v.year ?? null,
          publisher: v.publisher ?? '',
          description: v.description ?? '',
          isbn: v.isbn ?? '',
          image: v.image ?? '' // mostra preview se tiver
        };
        this.clearImage = false;
      } else {
        // reset para “adicionar”
        this.form = {
          title: '',
          author: '',
          year: null,
          publisher: '',
          description: '',
          isbn: '',
          image: ''
        };
        this.clearImage = false;
      }
    }
  }

  onImageSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = 200 * 1024;
    const maxWidth = 600;

    this.readAndCompressImage(file, maxWidth, maxBytes)
      .then(base64 => {
        this.form.image = base64;
        this.clearImage = false; // se escolheu nova imagem, desmarca limpar
      })
      .catch(err => console.error(err));
  }

  doSubmit() {
  const normalizeYear = (y: unknown): number | null => {
    if (y === null || y === undefined || y === '') return null;
    const n = Number(y);
    return Number.isFinite(n) ? n : null;
  };

  const isEdit = !!this.initial;

  // Base payload
  const payload: AddBookForm = {
    title: this.form.title.trim(),
    author: this.form.author?.trim() || '',
    description: this.form.description?.trim() || '',
    isbn: this.form.isbn?.trim() || '',
    year: normalizeYear(this.form.year),
    publisher: this.form.publisher?.trim() || undefined,
    image: undefined // definimos abaixo
  };

  if (!payload.title) {
    alert('Informe ao menos o título');
    return;
  }

  // Regras de imagem
  if (isEdit) {
    if (this.canClearImage && this.clearImage) {
      payload.image = ''; // limpar no back
    } else {
      const decided = this.resolveImageForEdit(); // undefined | base64
      if (decided !== undefined) payload.image = decided;
      // se undefined, não envia → back não mexe na imagem
    }
  } else {
    // criar: se usuário anexou, envia; se não, manda '' para não quebrar validação do back
    payload.image = this.form.image ? this.form.image : '';
  }

  this.submit.emit(payload);
}

/**
 * Em edição, decide se a imagem deve ser enviada:
 * - undefined => não mexe
 * - string base64 => troca a capa
 */
private resolveImageForEdit(): string | undefined {
  const init = this.initial?.image ?? null;
  const cur  = this.form.image ?? null;

  // sem mudança
  if (init === cur) return undefined;

  // trocou/adicionou
  if (cur) return cur;

  // remove é tratado pelo checkbox (clearImage) no doSubmit
  return undefined;
}


  // utilitários de imagem
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

      const supportsQuality = /jpeg|jpg|webp/i.test(mime);
      let quality = supportsQuality ? 0.85 : 1.0;

      const toSize = (b64: string) => {
        const pure = b64.split(',')[1] || '';
        return Math.floor((pure.length * 3) / 4);
      };

      let dataUrl = canvas.toDataURL(supportsQuality ? 'image/jpeg' : mime, quality);
      let bytes = toSize(dataUrl);

      while (bytes > maxBytes && supportsQuality && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        bytes = toSize(dataUrl);
      }

      if (bytes > maxBytes && w > 320) {
        const newMax = Math.max(320, Math.floor(w * 0.8));
        resolve(this.toCompressedDataURL(img, mime, newMax, maxBytes));
        return;
      }
      resolve(dataUrl);
    });
  }
}
