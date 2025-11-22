import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OfertaView, OfferCardComponent } from '../../components/offer-card/offer-card.component';
import { CartItem, CartService, Seller } from '../../services/cart.service';
import { Listing, ListingService } from '../../services/listing.service';

@Component({
  standalone: true,
  selector: 'app-bazar',
  imports: [CommonModule, FormsModule, OfferCardComponent],
  templateUrl: './bazar.component.html',
  styleUrls: ['./bazar.component.css']
})
export class BazarComponent implements OnInit {
  items: Listing[] = [];
  total = 0; page = 1; pageSize = 20; pages = 1;
  q = ''; sort = 'recent';
  minPrice?: number; maxPrice?: number;
  loading = false; error = '';
  quantities: Record<string, number> = {};

  constructor(
    private listing: ListingService,
    private cart: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const qParam = params.get('q');
      this.q = qParam ?? '';
      this.load(1);
    });
  }

  load(p = this.page) {
    this.loading = true;
    this.error = '';
    this.page = Math.max(1, p);

    this.listing.getListings({
      q: this.q,
      sort: this.sort,
      page: this.page,
      pageSize: this.pageSize,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    }).subscribe({
      next: res => {
        this.items = res.items;
        this.total = res.total;
        this.pages = Math.max(1, Math.ceil(res.total / this.pageSize));
        this.loading = false;
      },
      error: e => {
        this.error = e?.error?.message || 'Falha ao carregar bazar';
        this.loading = false;
      }
    });
  }

  clearFilters() {
    this.q = '';
    this.sort = 'recent';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.load(1);
  }

  /** Listing -> OfertaView usada no offer-card */
  toOferta(listing: Listing): OfertaView {
    const seller = this.resolveSeller(listing);
    return {
      id: listing._id,
      vendedor: seller,
      estado: listing.condition,
      preco: listing.price,
      titulo: listing.bookSnapshot.title,
      autor: listing.bookSnapshot.author,
      capa: listing.bookSnapshot.image,
      disponibilidade: listing.stock,
      envio: listing.shipping
      // menorPreco: (pode adicionar lógica depois)
    };
  }

  addToCart(listing: Listing) {
    const qty = this.sanitizeQty(this.getQuantity(listing), listing.stock);
    if (qty <= 0) return;
    const item = this.toCartItem(listing, qty);
    this.cart.add(item, qty);
    this.quantities[listing._id] = qty;
  }

  decrease(listing: Listing) {
    const current = this.getQuantity(listing);
    if (current <= 1) return;
    this.quantities[listing._id] = current - 1;
  }

  increase(listing: Listing) {
    const current = this.getQuantity(listing);
    const next = current + 1;
    const clamped = this.sanitizeQty(next, listing.stock);
    if (clamped > current) this.quantities[listing._id] = clamped;
  }

  private toCartItem(listing: Listing, qty: number): CartItem {
    const sellerData = this.resolveSeller(listing);
    return {
      id: listing._id,
      titulo: listing.bookSnapshot.title,
      autor: listing.bookSnapshot.author,
      capa: listing.bookSnapshot.image,
      preco: listing.price,
      estado: listing.condition,
      vendedor: sellerData,
      qty,
      stock: listing.stock,
      shipping: listing.shipping
    };
  }

  private resolveSeller(listing: Listing): Seller {
    const anyListing = listing as Listing & {
      seller?: Partial<Seller> & { nome?: string; name?: string; _id?: string; id?: string };
      sellerName?: string;
    };

    const sellerPayload = anyListing.seller ?? null;

    const id =
      (sellerPayload?.id as string) ??
      (sellerPayload?._id as string) ??
      (listing as any).sellerId ??
      (listing as any).seller?.id ??
      'desconhecido';

    const nome =
      (sellerPayload?.nome as string) ??
      (sellerPayload?.name as string) ??
      (anyListing.sellerName as string) ??
      'Vendedor';

    return {
      id,
      nome,
      reputacao: sellerPayload?.reputacao,
      cidade: sellerPayload?.cidade
    };
  }

  getQuantity(listing: Listing): number {
    const current = this.quantities[listing._id];
    if (current == null) {
      const init = this.sanitizeQty(1, listing.stock);
      this.quantities[listing._id] = init > 0 ? init : 1;
      return this.quantities[listing._id];
    }
    return current;
  }

  private sanitizeQty(qty: number, stock: number): number {
    const n = Math.floor(Number(qty) || 0);
    if (n <= 0) return 0;
    if (stock > 0) return Math.min(n, stock);
    return n;
  }
}
