import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-collection',
  imports: [NgIf, RouterLink],
  templateUrl: './card-collection.component.html',
  styleUrl: './card-collection.component.css'
})
export class CardCollectionComponent {
  @Input() name!: string;
  @Input() image!: string;
  @Input() id!: number;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit() {
    console.log("clicou em editar");
    
    this.edit.emit();
  }

  onDelete() {
    console.log("clicou em excluir");
    this.delete.emit();
  }

}
