import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-article',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './card-article.component.html',
  styleUrl: './card-article.component.css'
})
export class CardArticleComponent {
  @Input() imagemUrl!: string;
  @Input() titulo!: string;
  @Input() resumo!: string;
  @Input() autor!: string;
  @Input() tempo!: string;
  @Input() tags!: string[];
  @Input() id!: string; 

}
