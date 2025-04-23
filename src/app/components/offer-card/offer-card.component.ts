import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-offer-card',
  imports: [NgIf],
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.css'
})
export class OfferCardComponent {
  @Input() oferta!: {
    vendedor: string;
    estado: string;
    preco: number;
    menorPreco?: boolean;
  };
}
