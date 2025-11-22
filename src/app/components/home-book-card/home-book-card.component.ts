import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home-book-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-book-card.component.html',
  styleUrl: './home-book-card.component.css'
})
export class HomeBookCardComponent {
  @Input() imageUrl = '';
  @Input() titulo = '';
  @Input() autor = '';
  @Input() ano = '';
  @Input() status = '';
}
