import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-name-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './name-dialog.component.html',
  styleUrls: ['./name-dialog.component.css'],
})
export class NameDialogComponent {
  @Input() title = 'Definir nome';
  @Input() submitLabel = 'Salvar';
  @Input() initial = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  name = '';

  ngOnInit(){ this.name = this.initial || ''; }

  doSubmit(){
    const v = (this.name ?? '').trim();
    if (!v) return;
    this.submit.emit(v);
  }
}
