import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-page',
  imports: [CommonModule,NgIf],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.css'
})

export class BookPageComponent {
  loading = false;
  error = '';

  // dados do livro
  imageUrl = '';
  title = '';
  author = '';
  publisher = '';  // se não existir no back, deixa vazio
  year: string | number | null = null;
  isbn = '';
  description = '';

  constructor(private route: ActivatedRoute, private books: BookService) {}

  ngOnInit(): void {
  const collectionId = this.route.snapshot.paramMap.get('collectionId');
  const bookId       = this.route.snapshot.paramMap.get('bookId');
  
  if (!collectionId || !bookId) {
    this.error = 'Livro não informado';
    return;
  }

  this.loading = true;
  this.books.getBook(collectionId, bookId).subscribe({
    next: (b) => {
      this.title = b.title ?? '';
      this.author = b.author ?? '';
      this.isbn = b.isbn ?? '';
      this.description = b.description ?? '';
      this.imageUrl = b.image ?? '';
      this.loading = false;
    },
    error: (e) => {
      console.error(e);
      this.error = e?.error?.message || 'Falha ao carregar o livro';
      this.loading = false;
    }
  });
}

  get hasImage(): boolean { return !!this.imageUrl; }
}
