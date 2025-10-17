import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';

type Oferta = {
  id: string;
  titulo: string;
  autor: string;
  capa?: string;
  preco: number;
  estado: string;
  vendedor: { id: string; nome: string; reputacao?: number; cidade?: string };
  dataPublicacao: string; // ISO
  menorPreco?: boolean;   // calculado
};
@Component({
  selector: 'app-bazar',
  imports: [CommonModule, OfferCardComponent],
  templateUrl: './bazar.component.html',
  styleUrl: './bazar.component.css'
})
export class BazarComponent {
  constructor(private router: Router) {}
  // ordenações possíveis
  sortOptions = [
    { value: 'recent', label: 'Mais recentes' },
    { value: 'price',  label: 'Menor preço' },
    { value: 'rating', label: 'Melhor reputação' },
  ];
  sortBy: 'recent' | 'price' | 'rating' = 'recent';

  // paginação simples
  pageSize = 6;
  visibleCount = this.pageSize;

  // MOCK
  ofertas: Oferta[] = [
    {
      id: '1',
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      preco: 24.00,
      estado: 'Usado - Bom',
      vendedor: { id: 'u1', nome: 'Sebo da Esquina', reputacao: 4.6, cidade: 'SP' },
      dataPublicacao: '2025-04-10',
      capa: 'assets/imgs/dom-casmurro.jpg'
    },
    {
      id: '2',
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      preco: 29.90,
      estado: 'Usado - Excelente',
      vendedor: { id: 'u2', nome: 'João Livros', reputacao: 4.8, cidade: 'RJ' },
      dataPublicacao: '2025-04-12'
    },
    {
      id: '3',
      titulo: 'O Hobbit',
      autor: 'J.R.R. Tolkien',
      preco: 45.00,
      estado: 'Novo (Lacrado)',
      vendedor: { id: 'u3', nome: 'Edições Raras', reputacao: 4.9, cidade: 'SP' },
      dataPublicacao: '2025-04-11',
      capa: 'assets/imgs/hobbit.jpg'
    },
    {
      id: '4',
      titulo: 'O Hobbit',
      autor: 'J.R.R. Tolkien',
      preco: 38.50,
      estado: 'Usado - Quase novo',
      vendedor: { id: 'u4', nome: 'Maria Sebo', reputacao: 4.5, cidade: 'PR' },
      dataPublicacao: '2025-04-13'
    },
    {
      id: '5',
      titulo: '1984',
      autor: 'George Orwell',
      preco: 31.00,
      estado: 'Usado - Bom',
      vendedor: { id: 'u5', nome: 'Antônio Colecionador', reputacao: 4.2, cidade: 'RS' },
      dataPublicacao: '2025-04-09'
    },
    {
      id: '6',
      titulo: '1984',
      autor: 'George Orwell',
      preco: 27.50,
      estado: 'Usado - Excelente',
      vendedor: { id: 'u6', nome: 'Livraria Vintage', reputacao: 4.7, cidade: 'BA' },
      dataPublicacao: '2025-04-14'
    },
    {
      id: '7',
      titulo: '1984',
      autor: 'George Orwell',
      preco: 26.90,
      estado: 'Usado - Regular',
      vendedor: { id: 'u7', nome: 'Bibliomania', reputacao: 4.1, cidade: 'SP' },
      dataPublicacao: '2025-04-15'
    },
  ];

  get ofertasVisiveis(): Oferta[] {
    const sorted = this.sort(this.ofertasWithCheapestBadge());
    return sorted.slice(0, this.visibleCount);
  }

  // marca menor preço por título
  private ofertasWithCheapestBadge(): Oferta[] {
    // agrupa por título
    const byTitle = new Map<string, Oferta[]>();
    for (const o of this.ofertas
    ) {
      const key = o.titulo.toLowerCase();
      if (!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key)!.push(o);
    }
    // marca o menor preço em cada grupo
    const marked: Oferta[] = [];
    for (const [, group] of byTitle) {
      const min = Math.min(...group.map(g => g.preco));
      marked.push(...group.map(g => ({ ...g, menorPreco: g.preco === min })));
    }
    return marked;
  }

  sortByChanged(ev: Event) {
  const value = (ev.target as HTMLSelectElement).value as 'recent'|'price'|'rating';
  this.sortBy = value;
}


  private sort(items: Oferta[]): Oferta[] {
    const arr = [...items];
    switch (this.sortBy) {
      case 'price':
        arr.sort((a, b) => a.preco - b.preco);
        break;
      case 'rating':
        arr.sort((a, b) => (b.vendedor.reputacao ?? 0) - (a.vendedor.reputacao ?? 0));
        break;
      case 'recent':
      default:
        arr.sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
        break;
    }
    return arr;
  }

  loadMore() {
    this.visibleCount += this.pageSize;
  }

  onOpen(oferta: Oferta) {
    // Se você tiver o bookId é o ideal:
    // this.router.navigate(['/livro', oferta.bookId]);

    // Como nosso mock não tem, navegamos por título:
    this.router.navigate(['/livro'], { queryParams: { titulo: oferta.titulo } });
  }
  
}
