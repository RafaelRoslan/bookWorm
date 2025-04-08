import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-article-mini',
  imports: [CommonModule],
  templateUrl: './card-article-mini.component.html',
  styleUrl: './card-article-mini.component.css'
})
export class CardArticleMiniComponent {
  @Input() imagemUrl!: string;
  @Input() titulo!: string;
  @Input() resumo!: string;
  @Input() idArtigo!: number;

  constructor(private router: Router) {}

  irParaArtigo() {
      // Ex: navegar para rota de todos os livros
      console.log('Ir para página completa do artigo');
    
  }
}
