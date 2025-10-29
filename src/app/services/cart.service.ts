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
}

const LS_KEY = 'bookworm_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items$ = new BehaviorSubject<CartItem[]>(this.restore());
  readonly items$ = this._items$.asObservable();

  readonly count$ = this.items$.pipe(map(list => list.length));
  readonly total$ = this.items$.pipe(map(list => list.reduce((acc, it) => acc + it.preco * (it.qty ?? 1), 0)));

  add(item: CartItem) {
    const current = this._items$.value;
    if (!current.find(i => i.id === item.id)) {
      const next = [...current, { ...item, qty: item.qty ?? 1 }];
      this._items$.next(next);
      this.persist(next);
    }
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
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  private persist(next: CartItem[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }
}
