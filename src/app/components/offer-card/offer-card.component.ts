import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type Seller = { id?: string; nome: string; reputacao?: number; cidade?: string; rating?: number };

export interface OfertaView {
  id?: string;
  vendedor: Seller | string;
  estado: string;
  preco: number;
  menorPreco?: boolean;
  titulo?: string;
  autor?: string;
  capa?: string;

  // NOVOS CAMPOS
  disponibilidade?: number;
  envio?: string;
}

@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-card.component.html',
  styleUrls: ['./offer-card.component.css']
})
export class OfferCardComponent {
  @Input() variant: 'list' | 'grid' = 'list';
  @Output() open = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<void>();

  // quantidade controlada pelo pai (Bazar)
  @Input() quantity = 1;
  @Input() maxStock?: number;
  @Output() increaseQty = new EventEmitter<void>();
  @Output() decreaseQty = new EventEmitter<void>();

  private _oferta: OfertaView = {
    vendedor: { nome: '' },
    estado: '',
    preco: 0
  };

  @Input() set oferta(value: OfertaView) {
    if (!value) return;
    if (typeof value.vendedor === 'string') {
      this._oferta = { ...value, vendedor: { nome: value.vendedor } };
    } else {
      this._oferta = value;
    }
  }
  get oferta(): OfertaView {
    return this._oferta;
  }

  get seller(): Seller {
    return this._oferta.vendedor as Seller;
  }

  get canDecrease(): boolean {
    return this.quantity > 1;
  }

  get canIncrease(): boolean {
    if (this.maxStock == null) return true;
    return this.quantity < this.maxStock;
  }

  handleOpen() {
    this.open.emit();
  }

  handleAddToCart(ev: Event) {
    ev.stopPropagation();
    this.addToCart.emit();
  }

  handleDecrease(ev: Event) {
    ev.stopPropagation();
    if (!this.canDecrease) return;
    this.decreaseQty.emit();
  }

  handleIncrease(ev: Event) {
    ev.stopPropagation();
    if (!this.canIncrease) return;
    this.increaseQty.emit();
  }

  conditionClass(estado: string): string {
    const s = (estado || '').toLowerCase();
    if (s.includes('novo') || s.includes('lacrado') || s.includes('mint')) return 'chip--mint';
    if (s.includes('excelente') || s.includes('near')) return 'chip--near';
    if (s.includes('bom') || s.includes('good')) return 'chip--good';
    if (s.includes('regular') || s.includes('played')) return 'chip--played';
    return 'chip--default';
  }

  getStars(rating?: number): string {
    if (rating == null || rating <= 0) return '☆☆☆☆☆';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }
}
