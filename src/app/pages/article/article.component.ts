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
    titulo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    autor: 'Roslan Andrade',
    dataPublicacao: '09/04/2025',
    conteudo: [
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam fermentum, ante a aliquet pretium, risus dui malesuada dolor, nec pharetra magna dui ac ex. Proin sit amet nunc ultricies, sollicitudin metus ac, egestas neque. In hac habitasse platea dictumst. Nam pretium fringilla elit, vel lobortis odio scelerisque vitae. Integer sapien tortor, pretium non lacus sit amet, tincidunt tincidunt augue. Integer lorem orci, pretium id consequat eu, molestie vitae quam. Phasellus molestie a diam interdum semper. Aliquam vel nulla ut risus interdum pharetra quis at ex. Nunc quis sem eros. Vivamus a dui varius, ultricies quam sed, dictum magna. Cras vel nisi vel sapien sagittis mollis. Morbi et risus sapien.`,

      `Mauris bibendum orci ligula. Aenean eget neque quis tortor venenatis rhoncus vitae id dui. Fusce malesuada nisi a magna rutrum tincidunt. Vestibulum nec ultrices mi. Pellentesque vitae pulvinar odio. Nulla quis purus posuere, rutrum neque sed, convallis felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi iaculis laoreet consequat. Donec vestibulum efficitur sem, id hendrerit nulla tempor egestas.`,
      
      `Donec quis imperdiet libero. Aliquam egestas eros lectus, nec mollis sapien varius sed. In hac habitasse platea dictumst. Morbi ullamcorper mi et risus pretium, at vehicula turpis blandit. Suspendisse erat odio, vulputate nec malesuada eu, suscipit et justo. Vestibulum efficitur facilisis dolor interdum dignissim. Quisque tincidunt ligula vitae consequat sagittis. Ut pharetra urna at nulla mattis, sed lacinia quam eleifend. Praesent efficitur semper risus quis semper. Nunc quis vulputate orci, in vestibulum nulla. Phasellus diam quam, lobortis sed eleifend non, imperdiet id eros. Fusce pellentesque enim nec nisl pulvinar, eu pulvinar erat imperdiet. Pellentesque eu interdum nisi, ut accumsan metus. Aliquam condimentum id lorem at porttitor.`
    ],
    imagemBanner: '',
    autorBio: {
      nome: 'Roslan Andrade',
      bio: ' Vivamus a dui varius, ultricies quam sed, dictum magna. Cras vel nisi vel sapien sagittis mollis. Morbi et risus sapien',
      fotoUrl: ''
    }
  };

  comentarios = [
    {
      usuario: 'Ana Souza',
      texto: 'Donec quis imperdiet libero. Aliquam egestas eros lectus, nec mollis sapien varius sed.',
      data: '09/04/2025',
      imagemUrl: ''
    },
    {
      usuario: 'Lucas Lima',
      texto: 'Fusce lacinia, nulla sed luctus porttitor, ante nunc porta augue, facilisis gravida magna erat sed enim. ',
      data: '09/04/2025',
      imagemUrl: ''
    }
  ];
}
