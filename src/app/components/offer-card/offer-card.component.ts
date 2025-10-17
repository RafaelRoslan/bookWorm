import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

type Seller = { id?: string; nome: string; reputacao?: number; cidade?: string };

export interface OfertaView {
  vendedor: Seller | string;
  estado: string;
  preco: number;
  menorPreco?: boolean;
  titulo?: string;
  autor?: string;
  capa?: string;
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

  private _oferta!: OfertaView;

  @Input() set oferta(value: OfertaView) {
    if (typeof value.vendedor === 'string') {
      this._oferta = { ...value, vendedor: { nome: value.vendedor } };
    } else {
      this._oferta = value;
    }
  }
  get oferta(): OfertaView { return this._oferta; }

  get seller(): Seller { return this._oferta.vendedor as Seller; }

  handleOpen() {
    this.open.emit();
  }


  conditionClass(estado: string): string {
  const s = estado.toLowerCase();
  if (s.includes('novo') || s.includes('lacrado') || s.includes('mint')) return 'chip--mint';
  if (s.includes('excelente') || s.includes('near')) return 'chip--near';
  if (s.includes('bom') || s.includes('good')) return 'chip--good';
  if (s.includes('regular') || s.includes('played')) return 'chip--played';
  return 'chip--default';
}

}
