import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { Offer } from '../../models/api.models';
import { CartService } from '../../services/cart.service';
import { OfferService } from '../../services/offer.service';

@Component({
  selector: 'app-bazar',
  standalone: true,
  imports: [CommonModule, OfferCardComponent],
  templateUrl: './bazar.component.html',
  styleUrl: './bazar.component.css'
})
export class BazarComponent implements OnInit {
  // estado
  loading = signal(true);
  error   = signal<string | null>(null);

  // dados
  private offers = signal<Offer[]>([]);

  // UI state
  sortBy = signal<'recent'|'price'|'rating'>('recent');
  sellerFilter = signal<string>(''); // filtrar por vendedor específico
  pageSize = 12;
  visibleCount = signal(this.pageSize);

  constructor(private offersApi: OfferService, private cart: CartService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.error.set(null);

    // Se o seu backend suporta query params, descomente e passe { sort: this.sortBy() ... }
    // this.offersApi.list({ sort: this.sortBy(), sellerId: this.sellerFilter() || undefined })
    this.offersApi.list()
      .subscribe({
        next: (data) => {
          this.offers.set(data ?? []);
          this.loading.set(false);
        },
        error: (e) => {
          console.error(e);
          this.error.set('Falha ao carregar ofertas.');
          this.loading.set(false);
        }
      });
  }

  // computed: filtra e ordena client-side
  filtered = computed(() => {
    const bySeller = this.sellerFilter();
    let arr = [...this.offers()];

    if (bySeller) {
      arr = arr.filter(o => o.vendedor?.id === bySeller);
    }

    // marca menor preço por título
    const groups = new Map<string, Offer[]>();
    arr.forEach(o => {
      const k = o.titulo.toLowerCase();
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(o);
    });
    const marked: Offer[] = [];
    for (const [, g] of groups) {
      const min = Math.min(...g.map(x => x.preco));
      marked.push(...g.map(x => ({ ...x, menorPreco: x.preco === min } as any)));
    }

    // ordena
    switch (this.sortBy()) {
      case 'price':
        marked.sort((a, b) => a.preco - b.preco);
        break;
      case 'rating':
        marked.sort((a, b) => (b.vendedor?.reputacao ?? 0) - (a.vendedor?.reputacao ?? 0));
        break;
      case 'recent':
      default:
        marked.sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
        break;
    }

    return marked;
  });

  ofertasVisiveis = computed(() => this.filtered().slice(0, this.visibleCount()));

  sortByChanged(value: 'recent'|'price'|'rating') {
    this.sortBy.set(value);
    // Se quiser carregar já ordenado do back:
    // this.fetch();
  }

  sellerChanged(value: string) {
    this.sellerFilter.set(value);
    // Se quiser filtrar no back:
    // this.fetch();
  }

  loadMore() {
    this.visibleCount.set(this.visibleCount() + this.pageSize);
  }

  // ação "comprar" vinda do card
  addToCart(oferta: Offer) {
    this.cart.add({
    id: oferta.id,
    titulo: oferta.titulo,
    autor: oferta.autor,
    estado: oferta.estado,
    preco: oferta.preco,
    capa: oferta.capa,
    vendedor: {                                 // ✅ use vendedor
      id: oferta.vendedor.id,
      nome: oferta.vendedor.nome,
      reputacao: oferta.vendedor.reputacao,
      cidade: oferta.vendedor.cidade
    }
    });
  }
}
