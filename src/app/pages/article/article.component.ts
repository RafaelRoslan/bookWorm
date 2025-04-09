import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { AuthorBioComponent } from '../../components/author-bio/author-bio.component';
import { BannerComponent } from '../../components/banner/banner.component';
import { CommentComponent } from '../../components/comment/comment.component';

@Component({
  selector: 'app-article',
  imports: [BannerComponent, AuthorBioComponent, CommentComponent, NgFor],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css'
})
export class ArticleComponent {
  artigo = {
    titulo: 'Como montar um deck eficiente no formato Commander',
    autor: 'Roslan Andrade',
    dataPublicacao: '09/04/2025',
    conteudo: [
      `Montar um deck Commander pode ser uma jornada tão empolgante quanto desafiadora. Neste artigo vamos explorar dicas para montar uma base de mana sólida, definir uma estratégia coesa e otimizar a sinergia entre suas cartas.`,
      `Um bom ponto de partida é escolher seu comandante e em seguida buscar cartas que complementem suas habilidades. Mas não se esqueça de incluir formas de remoção, aceleração de mana e formas de lidar com as ameaças dos oponentes.`
    ],
    imagemBanner: '',
    autorBio: {
      nome: 'Roslan Andrade',
      bio: 'Professor, desenvolvedor e entusiasta de TCGs. Compartilha conteúdos sobre jogos, tecnologia e educação.',
      fotoUrl: ''
    }
  };

  comentarios = [
    {
      usuario: 'Ana Souza',
      texto: 'Adorei as dicas! Estou começando agora e isso me ajudou muito.',
      data: '09/04/2025',
      imagemUrl: ''
    },
    {
      usuario: 'Lucas Lima',
      texto: 'Você acha válido usar tutor em decks casuais?',
      data: '09/04/2025',
      imagemUrl: ''
    }
  ];
}
