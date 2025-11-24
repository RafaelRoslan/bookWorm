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
  @Input() vendedor = '';
  @Input() rating?: number;

  getStars(rating?: number): string {
    if (rating == null || rating <= 0) return '☆☆☆☆☆';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }
}
