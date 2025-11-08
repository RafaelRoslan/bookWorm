import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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
  priceBR = /^\d+(,\d{0,2})?$/;

  form: Omit<SellForm, 'price'> = {
    condition: 'bom',
    stock: 1,
    shipping: 'combinado'
  };

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(e: KeyboardEvent | Event) { e.preventDefault(); }

  
private parseBRL(v: string): number | null {
  if (!v) return null;
  v = v.trim();
  if (!this.priceBR.test(v)) return null;       // exige "12" ou "12,34"
  const n = Number(v.replace(',', '.'));        // 12,34 -> 12.34
  return Number.isFinite(n) && n >= 0 ? n : null;
}

  onPriceInput(val: string): void {
  let v = (val ?? '').replace(/\./g, ',');     // 15.15 -> 15,15
  v = v.replace(/[^\d,]/g, '');                 // só dígitos/ vírgula
  const parts = v.split(',');
  if (parts.length > 2) v = parts[0] + ',' + parts.slice(1).join('');
  if (parts[1]?.length > 2) v = parts[0] + ',' + parts[1].slice(0, 2);
  if (v.startsWith(',')) v = '0' + v;
  this.priceStr = v;
}

  doSubmit() {
  const parsed = this.parseBRL(this.priceStr);
  //console.log('[SELL] payload price ->', parsed, 'from', this.priceStr);
  if (parsed === null) { alert('Preço inválido'); return; }

  const payload = {
    price: parsed,                               // número mesmo
    condition: this.form.condition,
    stock: Math.max(1, Number(this.form.stock) || 1),
    shipping: this.form.shipping
  };

  this.submit.emit(payload);
}


}
