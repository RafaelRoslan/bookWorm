import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Negotiation } from '../models/api.models';

type CartGroupPayload = {
  seller: { id: string; nome: string };
  buyer:  { id: string; nome: string };
  items:  { offerId: string; titulo: string; autor: string; condicao?: string; preco: number; quantidade: number }[];
};

@Injectable({ providedIn: 'root' })
export class NegotiationsService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listMine(): Observable<Negotiation[]> {
    return this.http.get<Negotiation[]>(`${this.api}/negotiations`, { params: { mine: 1 as any } });
  }

  getById(id: string): Observable<Negotiation> {
    return this.http.get<Negotiation>(`${this.api}/negotiations/${id}`);
  }

  createFromCartGroups(groups: CartGroupPayload[], whoFirst: 'buyer'|'seller') {
    return this.http.post<Negotiation[]>(`${this.api}/negotiations/from-cart`, { groups, whoFirst });
  }

  accept(id: string) {
    return this.http.patch<Negotiation>(`${this.api}/negotiations/${id}/accept`, {});
  }

  markPaid(id: string, body: { method: 'PIX'|'TED'|'BOLETO'; comprovanteUrl?: string }) {
    return this.http.patch<Negotiation>(`${this.api}/negotiations/${id}/mark-paid`, body);
  }

  markShipped(id: string, body: { carrier?: string; trackingCode?: string }) {
    return this.http.patch<Negotiation>(`${this.api}/negotiations/${id}/mark-shipped`, body);
  }
}






/*
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PartyRef = { id: string; nome: string; };
export type NegotiationItem = {
  offerId: string; titulo: string; autor?: string;
  condicao?: string; preco: number; quantidade: number;
};
export type NegotiationStatus =
  | 'PENDING_SELLER_ACCEPT' | 'ACTIVE' | 'WAITING_BUYER' | 'WAITING_SELLER'
  | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
export type WhoFirst = 'buyer' | 'seller';
export type PaymentInfo = { method?: 'PIX'|'TED'|'BOLETO'; pixChave?: string; comprovanteUrl?: string; paidAt?: string; };
export type ShipmentInfo = { carrier?: string; trackingCode?: string; sentAt?: string; };
export type NegotiationLog = { at: string; by: 'buyer'|'seller'|'system'; message: string; };
export type Negotiation = {
  id: string; buyer: PartyRef; seller: PartyRef; items: NegotiationItem[];
  totalItens: number; totalPrice: number;
  status: NegotiationStatus; whoFirst: WhoFirst;
  createdAt: string; acceptedAt?: string;
  buyerDeadline?: string; sellerDeadline?: string;
  payment?: PaymentInfo; shipment?: ShipmentInfo;
  logs: NegotiationLog[];
};

const LS_KEY = 'negotiations_v1';
const BUYER_DEADLINE_DAYS = 7;
const SELLER_DEADLINE_DAYS = 7;
function iso(d = new Date()) { return new Date(d).toISOString(); }
function addDays(base: Date | string, days: number) {
  const d = new Date(base); d.setDate(d.getDate() + days); return d.toISOString();
}

@Injectable({ providedIn: 'root' })

export class NegotiationsService {
  private _list$ = new BehaviorSubject<Negotiation[]>(this.load());
  list$ = this._list$.asObservable();
  private get list() { return this._list$.value; }
  private set list(v: Negotiation[]) { this._list$.next(v); localStorage.setItem(LS_KEY, JSON.stringify(v)); }

  private load(): Negotiation[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
  }
  private pushLog(neg: Negotiation, by: 'buyer'|'seller'|'system', message: string) {
    neg.logs.push({ at: iso(), by, message });
  }

  createFromCartGroups(groups: { seller: PartyRef; buyer: PartyRef; items: NegotiationItem[]; }[], whoFirst: WhoFirst = 'buyer'): Negotiation[] {
    const created = groups.map(g => {
      const id = crypto.randomUUID();
      const totalItens = g.items.reduce((s, i) => s + i.quantidade, 0);
      const totalPrice = g.items.reduce((s, i) => s + i.preco * i.quantidade, 0);
      const neg: Negotiation = {
        id, buyer: g.buyer, seller: g.seller, items: g.items,
        totalItens, totalPrice, status: 'PENDING_SELLER_ACCEPT',
        whoFirst, createdAt: iso(), logs: []
      };
      this.pushLog(neg, 'system', 'Negociação criada e aguardando aceite do vendedor.');
      return neg;
    });
    this.list = [...this.list, ...created];
    return created;
  }

  getById(id: string) { return this.list.find(n => n.id === id); }

  accept(id: string) {
    const n = this.getById(id); if (!n || n.status !== 'PENDING_SELLER_ACCEPT') return;
    n.acceptedAt = iso();
    if (n.whoFirst === 'buyer') { n.status = 'WAITING_BUYER'; n.buyerDeadline = addDays(n.acceptedAt, BUYER_DEADLINE_DAYS); }
    else { n.status = 'WAITING_SELLER'; n.sellerDeadline = addDays(n.acceptedAt, SELLER_DEADLINE_DAYS); }
    this.pushLog(n, 'seller', 'Vendedor aceitou a negociação.');
    this.save(n);
  }

  markPaid(id: string, info: Partial<Negotiation['payment']>) {
    const n = this.getById(id); if (!n) return;
    n.payment = { ...n.payment, ...info, paidAt: iso() };
    if (!n.sellerDeadline) n.sellerDeadline = addDays(new Date(), SELLER_DEADLINE_DAYS);
    this.pushLog(n, 'buyer', 'Comprador informou o pagamento.');
    n.status = 'WAITING_SELLER';
    this.save(n);
  }

  markShipped(id: string, info: Partial<Negotiation['shipment']>) {
    const n = this.getById(id); if (!n) return;
    n.shipment = { ...n.shipment, ...info, sentAt: iso() };
    if (!n.buyerDeadline) n.buyerDeadline = addDays(new Date(), BUYER_DEADLINE_DAYS);
    this.pushLog(n, 'seller', 'Vendedor informou o envio.');
    if (n.payment?.paidAt && n.shipment?.sentAt) { n.status = 'COMPLETED'; this.pushLog(n, 'system', 'Negociação finalizada.'); }
    else { n.status = 'WAITING_BUYER'; }
    this.save(n);
  }

  cancel(id: string, by: 'buyer'|'seller') {
    const n = this.getById(id); if (!n) return;
    n.status = 'CANCELLED'; this.pushLog(n, by, 'Negociação cancelada.'); this.save(n);
  }

  checkExpire(id: string) {
    const n = this.getById(id); if (!n) return;
    const now = new Date();
    const buyerLate = n.buyerDeadline && new Date(n.buyerDeadline) < now;
    const sellerLate = n.sellerDeadline && new Date(n.sellerDeadline) < now;
    if ((n.status === 'WAITING_BUYER' && buyerLate) || (n.status === 'WAITING_SELLER' && sellerLate)) {
      n.status = 'EXPIRED'; this.pushLog(n, 'system', 'Negociação expirada por prazo.'); this.save(n);
    }
  }

  private save(neg: Negotiation) { this.list = this.list.map(x => x.id === neg.id ? { ...neg } : x); }
}
*/