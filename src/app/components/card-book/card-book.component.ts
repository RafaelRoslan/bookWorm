import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-book',
  imports: [NgIf],
  templateUrl: './card-book.component.html',
  styleUrl: './card-book.component.css'
})
export class CardBookComponent {
  @Input() imageUrl!: string;
  @Input() titulo!: string;
  @Input() autor!: string;
  @Input() ano!: string;
  @Input() status!: string;

  get hasImage(): boolean {
    return !!this.imageUrl;
  }
}
