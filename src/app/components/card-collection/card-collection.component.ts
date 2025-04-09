import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card-collection',
  imports: [NgIf],
  templateUrl: './card-collection.component.html',
  styleUrl: './card-collection.component.css'
})
export class CardCollectionComponent {
  @Input() name!: string;
  @Input() image!: string;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }

}
