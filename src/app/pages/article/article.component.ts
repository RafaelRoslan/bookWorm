import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorBioComponent } from '../../components/author-bio/author-bio.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { CommentComponent } from '../../components/comment/comment.component';

import { Article, ArticleComment } from '../../models/api.models';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule, BannerComponent, AuthorBioComponent, CommentComponent],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
})
export class ArticleComponent {
  loading = true;
  error = '';
  artigo: Article | null = null;

  // por enquanto, comentários mock (back de comentários fica pra depois)
  comentarios: ArticleComment[] = [];

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Artigo não informado.';
      this.loading = false;
      return;
    }

    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.artigo = article;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigo:', err);
        this.error = 'Não foi possível carregar o artigo.';
        this.loading = false;
      },
    });
  }
}
