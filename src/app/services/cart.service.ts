import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export type Seller = { id: string; nome: string; reputacao?: number; cidade?: string };

export interface CartItem {
  id: string;
  titulo: string;
  autor: string;
  capa?: string;
  preco: number;
  estado: string;
  vendedor: Seller;
  qty?: number;
  stock?: number;
  shipping?: string;
}

const LS_KEY = 'bookworm_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items$ = new BehaviorSubject<CartItem[]>(this.restore());
  readonly items$ = this._items$.asObservable();

  readonly count$ = this.items$.pipe(map(list => list.reduce((acc, it) => acc + (it.qty ?? 1), 0)));
  readonly total$ = this.items$.pipe(map(list => list.reduce((acc, it) => acc + it.preco * (it.qty ?? 1), 0)));

  add(item: CartItem, quantity?: number) {
    const current = this._items$.value;
    const desiredQty = quantity ?? item.qty ?? 1;
    const sanitizedQty = this.sanitizeQty(desiredQty, item.stock);
    if (sanitizedQty <= 0) return;

    const idx = current.findIndex(i => i.id === item.id);
    if (idx === -1) {
      const next = [...current, { ...item, qty: sanitizedQty }];
      this._items$.next(next);
      this.persist(next);
    } else {
      const next = [...current];
      const existing = next[idx];
      const stock = item.stock ?? existing.stock;
      if (stock != null && (existing.qty ?? 1) >= stock) return;
      const newQty = this.sanitizeQty((existing.qty ?? 1) + sanitizedQty, stock);
      next[idx] = { ...existing, qty: newQty, stock: stock ?? existing.stock };
      this._items$.next(next);
      this.persist(next);
    }
  }

  updateQuantity(id: string, qty: number) {
    const current = this._items$.value;
    const idx = current.findIndex(i => i.id === id);
    if (idx === -1) return;
    const existing = current[idx];
    const sanitized = this.sanitizeQty(qty, existing.stock);
    if (sanitized <= 0) {
      this.remove(id);
      return;
    }
    if (sanitized === (existing.qty ?? 1)) return;
    const next = [...current];
    next[idx] = { ...existing, qty: sanitized };
    this._items$.next(next);
    this.persist(next);
  }

  remove(id: string) {
    const next = this._items$.value.filter(i => i.id !== id);
    this._items$.next(next);
    this.persist(next);
  }

  clear() {
    this._items$.next([]);
    this.persist([]);
  }

  groupBySeller() {
    const groups = new Map<string, { seller: Seller; items: CartItem[]; total: number }>();
    for (const it of this._items$.value) {
      const key = it.vendedor.id;
      if (!groups.has(key)) groups.set(key, { seller: it.vendedor, items: [], total: 0 });
      const g = groups.get(key)!;
      g.items.push(it);
      g.total += it.preco * (it.qty ?? 1);
    }
    return Array.from(groups.values());
  }

  private restore(): CartItem[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => ({
        ...item,
        qty: this.sanitizeQty(item.qty ?? 1, item.stock)
      }));
    } catch { return []; }
  }
  private persist(next: CartItem[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  private sanitizeQty(qty: number | null | undefined, stock?: number): number {
    const n = Math.floor(Number(qty) || 0);
    if (n <= 0) return 0;
    if (stock != null && stock > 0) {
      return Math.min(n, stock);
    }
    return n;
  }
}
