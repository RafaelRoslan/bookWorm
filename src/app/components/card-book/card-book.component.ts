import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-book',
  imports: [NgIf, RouterLink],
  templateUrl: './card-book.component.html',
  styleUrl: './card-book.component.css'
})
export class CardBookComponent {
  @Input() imageUrl!: string;
  @Input() titulo!: string;
  @Input() autor!: string | null;
  @Input() ano!: string | number |null;
  @Input() status!: string;
  @Input() id!: string;
  @Input() collectionId!: string;

  get hasImage(): boolean {
    return !!this.imageUrl;
  }
}
