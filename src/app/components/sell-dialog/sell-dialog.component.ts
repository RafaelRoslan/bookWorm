import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type BookVM = {
  _id: string;
  titulo: string;
  autor?: string;
  imageUrl?: string | null;
};

export type SellForm = {
  price: number;
  condition: 'novo'|'como_novo'|'bom'|'regular'|'danificado';
  stock: number;
  shipping: 'retirada'|'correios'|'combinado';
};

@Component({
  selector: 'app-sell-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './sell-dialog.component.html',
  styleUrl: './sell-dialog.component.css'
})
export class SellDialogComponent {
  @Input() book!: BookVM;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<SellForm>();

  priceStr = '10,00';

  form: Omit<SellForm, 'price'> = {
    condition: 'bom',
    stock: 1,
    shipping: 'combinado'
  };

  //@HostListener('document:keydown.escape', ['$event'])
  onEsc(e: KeyboardEvent) { e.preventDefault(); }

  onPriceInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = input.value.replace(/[^\d,]/g, '');
    const parts = v.split(',');
    if (parts.length > 2) {
      v = parts[0] + ',' + parts.slice(1).join(''); // apenas uma vírgula
    }
    this.priceStr = v;
  }

  doSubmit() {
    // normaliza "10,00" -> 10.00
    const raw = (this.priceStr ?? '').trim().replace('.', '').replace(',', '.');
    const price = Number(raw);

    if (!Number.isFinite(price) || price < 0) {
      // mostre um erro local ou desabilite o botão
      alert('Preço inválido'); // troque por UI que preferir
      return;
    }

    const payload = {
      price,
      condition: this.form.condition,
      stock: Math.max(1, Number(this.form.stock) || 1),
      shipping: this.form.shipping
    };

    this.submit.emit(payload);
  }
}
