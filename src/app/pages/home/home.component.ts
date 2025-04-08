import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BannerComponent } from "../../components/banner/banner.component";
import { CardArticleMiniComponent } from '../../components/card-article-mini/card-article-mini.component';
import { CardBookComponent } from "../../components/card-book/card-book.component";

@Component({
  selector: 'app-home',
  imports: [BannerComponent, CardBookComponent, CardArticleMiniComponent, NgFor, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;  

  livros = [
    {
      titulo: 'Pegasus e o Fogo do Olimpo',
      autor: 'Kate O\'Hearn',
      ano: '2020',
      status: 'Disponível',
      imageUrl: ''
    },
    {
      titulo: 'Mestres do Tempo',
      autor: 'R.V. Campbell',
      ano: '2021',
      status: 'Disponível',
      imageUrl: ''
    },
    {
      titulo: 'É Assim que Acaba',
      autor: 'Colleen Hoover',
      ano: '2022',
      status: 'Indisponível',
      imageUrl: ''
    },
    {
      titulo: 'Pegasus e o Fogo do Olimpo4',
      autor: 'Kate O\'Hearn',
      ano: '2020',
      status: 'Disponível',
      imageUrl: ''
    },
    {
      titulo: 'Mestres do Tempo5',
      autor: 'R.V. Campbell',
      ano: '2021',
      status: 'Disponível',
      imageUrl: ''
    },
    {
      titulo: 'É Assim que Acaba6',
      autor: 'Colleen Hoover',
      ano: '2022',
      status: 'Indisponível',
      imageUrl: ''
    },
    {
      titulo: 'Pegasus e o Fogo do Olimpo7',
      autor: 'Kate O\'Hearn',
      ano: '2020',
      status: 'Disponível',
      imageUrl: ''
    },
    {
      titulo: 'Mestres do Tempo8',
      autor: 'R.V. Campbell',
      ano: '2021',
      status: 'Disponível',
      imageUrl: ''
    },
    {
      titulo: 'É Assim que Acaba9',
      autor: 'Colleen Hoover',
      ano: '2022',
      status: 'Indisponível',
      imageUrl: ''
    }
  ];

  artigos = [
    {
      id: 1,
      titulo: 'Como organizar sua estante de livros',
      imagemUrl: '',
      resumo: 'Aprenda dicas práticas para manter sua coleção organizada, bonita e funcional no dia a dia.',
    },
    {
      id: 2,
      titulo: 'Os melhores lançamentos de fantasia em 2025',
      imagemUrl: '',
      resumo: 'Uma lista com os principais títulos do ano para quem ama mundos mágicos, criaturas e aventuras épicas.',
    },
    {
      id: 3,
      titulo: 'Dicas de leitura para iniciantes',
      imagemUrl: '',
      resumo: 'Se você quer começar a ler mais, confira essas sugestões de livros leves e cativantes para todos os gostos.',
    },
  ];

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -220, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 220, behavior: 'smooth' });
  }

  irParaPaginaCompleta() {
    // Ex: navegar para rota de todos os livros
    console.log('Ir para página completa de livros');
  }

  constructor() { }

  ngOnInit(): void { }
}
