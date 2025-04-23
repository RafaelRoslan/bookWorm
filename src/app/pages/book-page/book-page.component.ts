import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';

@Component({
  selector: 'app-book-page',
  imports: [OfferCardComponent, NgFor],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.css'
})
export class BookPageComponent {

  ofertas = [
    {
      vendedor: 'João Livros',
      estado: 'Usado - Bom estado',
      preco: 29.90
    },
    {
      vendedor: 'Maria Sebo',
      estado: 'Usado - Excelente estado',
      preco: 27.50
    },
    {
      vendedor: 'Antônio Colecionador',
      estado: 'Novo (Lacrado)',
      preco: 45.00
    },
    {
      vendedor: 'Sebo da Esquina',
      estado: 'Usado - Regular',
      preco: 24.00 // esse é o menor preço
    },
    {
      vendedor: 'Edições Raras',
      estado: 'Usado - Quase novo',
      preco: 31.00
    }
  ];
  


  ngOnInit(): void {
    const menorPreco = Math.min(...this.ofertas.map(o => o.preco));
    this.ofertas = this.ofertas.map(o => ({
      ...o,
      menorPreco: o.preco === menorPreco
    }));
  }

  
}
