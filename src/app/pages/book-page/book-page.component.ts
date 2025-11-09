// src/app/pages/book-page/book-page.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookDto, BookService } from '../../services/book.service';

type BookVM = {
  _id: string;
  title: string;
  author?: string;
  publisher?: string | null;
  year?: number | string | null;
  isbn?: string | null;
  description?: string | null;
  image?: string | null;
};

@Component({
  selector: 'app-book-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.css'
})
export class BookPageComponent {
  loading = false;
  error = '';
  book: BookVM | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookSvc: BookService // 👈 usar o BookService
  ) {}

  ngOnInit(): void {
    const collectionId = this.route.snapshot.paramMap.get('collectionId');
    const bookId = this.route.snapshot.paramMap.get('bookId');

    if (!collectionId || !bookId) {
      this.error = 'Livro não informado';
      return;
    }

    this.loading = true;
    this.bookSvc.getBook(collectionId, bookId).subscribe({
      next: (b: BookDto) => {
        if (!b) { this.error = 'Livro não encontrado'; this.loading = false; return; }

        this.book = {
          _id: b._id,
          title: b.title ?? b.titulo ?? '',
          author: b.author ?? b.autor ?? '',
          publisher: b.publisher ?? null,
          year: b.year ?? b.ano ?? null,
          isbn: b.isbn ?? null,
          description: b.description ?? null,
          image: b.image ?? b.imageUrl ?? b.cover ?? null
        };
        this.loading = false;
      },
      error: (e) => {
        console.error(e);
        this.error = e?.error?.message || 'Falha ao carregar livro';
        this.loading = false;
      }
    });
  }

  get hasImage(): boolean {
    return !!this.book?.image;
  }
}
