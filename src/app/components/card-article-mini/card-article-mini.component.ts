import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-article-mini',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card-article-mini.component.html',
  styleUrl: './card-article-mini.component.css'
})
export class CardArticleMiniComponent {
  @Input() imagemUrl!: string;
  @Input() titulo!: string;
  @Input() resumo!: string;
  @Input() idArtigo!: string;
  @Input() tipo?: 'article' | 'news'; // opcional, pra mostrar #Artigo / #Notícia

  get tipoLabel(): string | null {
    if (!this.tipo) return null;
    return this.tipo === 'news' ? 'Notícia' : 'Artigo';
  }
}
