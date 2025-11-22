import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AsideCardComponent } from '../../components/aside-card/aside-card.component';
import { CardArticleComponent } from '../../components/card-article/card-article.component';

import { Article } from '../../models/api.models';
import { ArticleService } from '../../services/article.service';

type ArticleCardVM = {
  id: string;
  titulo: string;
  resumo: string;
  imagem: string;
  autor: string;
  tempo: string;
  tags: string[];
};

@Component({
  selector: 'app-articles-news',
  standalone: true,
  imports: [CommonModule, CardArticleComponent, AsideCardComponent],
  templateUrl: './articles-news.component.html',
  styleUrls: ['./articles-news.component.css'],
})
export class ArticlesNewsComponent {
  loading = true;
  error = '';

  artigos: ArticleCardVM[] = [];
  destaques: ArticleCardVM[] = [];

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        const mapped = articles.map((a) => this.toCardVM(a));
        this.artigos = mapped;
        this.destaques = mapped.slice(0, 3); // por enquanto: top 3 como "mais lidos"
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigos:', err);
        this.error = 'Não foi possível carregar os artigos e notícias.';
        this.loading = false;
      },
    });
  }

  private toCardVM(article: Article): ArticleCardVM {
    return {
      id: article.id || (article as any)._id || '',
      titulo: article.title,
      resumo: article.summary,
      imagem: article.bannerImage ?? '',
      autor: article.authorName,
      tempo: this.buildTimeLabel(article),
      tags: [article.type === 'article' ? 'Artigo' : 'Notícia'],
    };
  }

  /** Converte publishedAt em coisas tipo "3h" ou "2d" */
  private buildTimeLabel(article: Article): string {
    if (!article.publishedAt) return '';

    const pub = new Date(article.publishedAt);
    const now = new Date();
    const diffMs = now.getTime() - pub.getTime();

    if (diffMs <= 0) return 'agora';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return diffHours <= 1 ? '1h' : `${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return diffDays <= 1 ? '1d' : `${diffDays}d`;
  }
}

