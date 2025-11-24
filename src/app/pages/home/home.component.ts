import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BannerComponent } from '../../components/banner/banner.component';
import { CardArticleMiniComponent } from '../../components/card-article-mini/card-article-mini.component';
import { HomeBookCardComponent } from '../../components/home-book-card/home-book-card.component';

import { Article } from '../../models/api.models';
import { ArticleService } from '../../services/article.service';
import { Listing, ListingService } from '../../services/listing.service';

type HomeBookVM = {
  titulo: string;
  autor: string;
  ano: string;
  status: string;
  imageUrl: string;
  vendedor: string;
  rating?: number;
};

type HomeArticleVM = {
  id: string;
  titulo: string;
  imagemUrl: string;
  resumo: string;
  tipo: 'article' | 'news';
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BannerComponent,
    HomeBookCardComponent,
    CardArticleMiniComponent,
    NgFor,
    NgIf,
    RouterLink,
    SlicePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  @ViewChild('carousel', { static: false }) carousel!: ElementRef<HTMLDivElement>;

  // Destaques do bazar
  livros: HomeBookVM[] = [];
  loadingBooks = true;
  errorBooks = '';

  // Assunto do momento (artigos / notícias)
  artigos: HomeArticleVM[] = [];
  loadingArticles = true;
  errorArticles = '';

  constructor(
    private articleService: ArticleService,
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBooksFromBazar();
    this.loadArticles();
  }

  // ---------- BAZAR: destaques ----------
  private loadBooksFromBazar(): void {
    this.listingService.getListings({ page: 1, pageSize: 8 }).subscribe({
      next: (res) => {
        const latest = res.items.slice(0, 8);

        this.livros = latest.map((l: Listing): HomeBookVM => {
          const anyListing = l as Listing & {
            seller?: { nome?: string; name?: string };
            sellerName?: string;
          };
          
          const vendedorNome =
            anyListing.seller?.nome ??
            anyListing.seller?.name ??
            anyListing.sellerName ??
            'Vendedor';

          return {
            titulo: l.bookSnapshot?.title ?? 'Livro',
            autor: l.bookSnapshot?.author ?? 'Autor desconhecido',
            ano: '',
            status: this.mapListingStatus(l.status),
            imageUrl: l.bookSnapshot?.image ?? '',
            vendedor: vendedorNome,
            rating: l.sellerRating,
          };
        });

        this.loadingBooks = false;
      },
      error: (err) => {
        console.error('Erro ao carregar bazar na home:', err);
        this.errorBooks = 'Não foi possível carregar os destaques do bazar.';
        this.loadingBooks = false;
      },
    });
  }

  private mapListingStatus(status: Listing['status']): string {
    switch (status) {
      case 'ativo':
        return 'Disponível';
      case 'pausado':
        return 'Pausado';
      case 'vendido':
        return 'Vendido';
      case 'expirado':
        return 'Expirado';
      case 'removido':
        return 'Removido';
      default:
        return 'Indisponível';
    }
  }

  // ---------- ARTIGOS / NOTÍCIAS ----------
  private loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles: Article[]) => {
        const latest = articles.slice(0, 3);
        this.artigos = latest.map((a): HomeArticleVM => ({
          id: a.id,
          titulo: a.title,
          imagemUrl: a.bannerImage ?? '',
          resumo: a.summary,
          tipo: a.type,
        }));
        this.loadingArticles = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigos na home:', err);
        this.errorArticles = 'Não foi possível carregar os artigos.';
        this.loadingArticles = false;
      },
    });
  }

  // ---------- Carousel ----------
  scrollLeft(): void {
    if (!this.carousel) return;
    this.carousel.nativeElement.scrollBy({ left: -220, behavior: 'smooth' });
  }

  scrollRight(): void {
    if (!this.carousel) return;
    this.carousel.nativeElement.scrollBy({ left: 220, behavior: 'smooth' });
  }

  // “Veja mais” → bazar
  irParaPaginaCompleta(): void {
    this.router.navigate(['/bazar']);
  }

  // Clique no card do livro na home → bazar com filtro pelo título
  irParaBazarComFiltro(livro: HomeBookVM): void {
    const q = livro.titulo || '';
    this.router.navigate(['/bazar'], { queryParams: { q } });
  }
}
