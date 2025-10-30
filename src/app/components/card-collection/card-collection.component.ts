import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-collection',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card-collection.component.html',
  styleUrls: ['./card-collection.component.css']
})
export class CardCollectionComponent {
  @Input() id!: string;
  @Input() name!: string;
  @Input() image?: string | null;

  // eventos para a página pai (Bookcase)
  @Output() edit = new EventEmitter<{ id: string; name: string }>();
  @Output() remove = new EventEmitter<string>();

  onEdit() {
    // 👇 emite o payload que o Bookcase espera
    this.edit.emit({ id: this.id, name: this.name });
  }

  onDelete() {
    // 👇 emite o id para remover
    this.remove.emit(this.id);
  }
}
