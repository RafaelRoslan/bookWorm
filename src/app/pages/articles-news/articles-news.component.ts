import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { AsideCardComponent } from '../../components/aside-card/aside-card.component';
import { CardArticleComponent } from '../../components/card-article/card-article.component';

@Component({
  selector: 'app-articles-news',
  imports: [CardArticleComponent, AsideCardComponent, NgFor],
  templateUrl: './articles-news.component.html',
  styleUrl: './articles-news.component.css'
})
export class ArticlesNewsComponent {
  artigos = [
    {
      titulo: 'Linguagem corporal no ambiente de trabalho',
      resumo: 'Descubra como a linguagem corporal pode influenciar sua comunicação e presença profissional...',
      imagem: '',
      autor: 'Equipe RH',
      tempo: '3h',
      tags: ['comunicação', 'carreira']
    },
    {
      titulo: 'Dicas para manter o foco no home office',
      resumo: 'O home office exige disciplina. Veja técnicas simples para manter sua produtividade em alta...',
      imagem: '',
      autor: 'Administração',
      tempo: '5h',
      tags: ['produtividade', 'home office']
    },
    {
      titulo: 'Tendências em capacitação para servidores',
      resumo: 'Novas tecnologias e metodologias estão mudando o jeito de aprender no serviço público...',
      imagem: '',
      autor: 'Setor de Capacitação',
      tempo: '1d',
      tags: ['capacitação', 'tecnologia']
    },
    {
      titulo: 'Tendências em capacitação para servidores',
      resumo: 'Novas tecnologias e metodologias estão mudando o jeito de aprender no serviço público...',
      imagem: '',
      autor: 'Setor de Capacitação',
      tempo: '1d',
      tags: ['capacitação', 'tecnologia']
    },
    {
      titulo: 'Tendências em capacitação para servidores',
      resumo: 'Novas tecnologias e metodologias estão mudando o jeito de aprender no serviço público...',
      imagem: '',
      autor: 'Setor de Capacitação',
      tempo: '1d',
      tags: ['capacitação', 'tecnologia']
    },
    {
      titulo: 'Tendências em capacitação para servidores',
      resumo: 'Novas tecnologias e metodologias estão mudando o jeito de aprender no serviço público...',
      imagem: '',
      autor: 'Setor de Capacitação',
      tempo: '1d',
      tags: ['capacitação', 'tecnologia']
    }
  ];

  destaques = [
    {
      titulo: 'Como organizar melhor sua agenda',
      imagem: '',
      autor: 'Planejamento',
      tempo: '6h',
      tags: ['organização']
    },
    {
      titulo: 'Importância da escuta ativa',
      imagem: '',
      autor: 'Comunicação',
      tempo: '2d',
      tags: ['escuta', 'soft skills']
    },
    {
      titulo: '5 livros sobre gestão que você precisa ler',
      imagem: '',
      autor: 'Educação Corporativa',
      tempo: '3d',
      tags: ['livros', 'gestão']
    }
  ];
}
