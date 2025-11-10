import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Negotiation } from '../models/api.models';

type CartGroupPayload = {
  seller: { id: string; nome: string };
  buyer:  { id: string; nome: string };
  items:  { offerId: string; titulo: string; autor: string; condicao?: string; preco: number; quantidade: number }[];
};

export type NegotiationSummary = {
  id: string;
  createdAt: string;
  totalPrice: number;
  evaluated: boolean;
  status?: string | null;
  buyer: PartySummary;
  seller: PartySummary;
  listings: ListingSummary[];
};

export type PartySummary = {
  id: string;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  email?: string | null;
};

export type ListingSummary = {
  id: string;
  title: string;
  author?: string | null;
  price: number;
  condition?: string | null;
  shipping?: string | null;
  image?: string | null;
};

export type NegotiationDetail = NegotiationSummary & {
  items: NegotiationItemDetail[];
  acceptedAt?: string | null;
  buyerDeadline?: string | null;
  sellerDeadline?: string | null;
  whoFirst?: 'buyer' | 'seller' | null;
  payment?: PaymentDetail | null;
  shipment?: ShipmentDetail | null;
  logs: NegotiationLogDetail[];
  trackingCodes: string[];
};

export type NegotiationItemDetail = {
  id: string;
  titulo: string;
  autor?: string | null;
  preco: number;
  quantidade: number;
  condicao?: string | null;
  shipping?: string | null;
  image?: string | null;
};

export type PaymentDetail = {
  method?: string | null;
  paidAt?: string | null;
  comprovanteImage?: string | null;
};

export type ShipmentDetail = {
  carrier?: string | null;
  trackingCode?: string | null;
  sentAt?: string | null;
  proofImage?: string | null;
};

export type NegotiationLogDetail = {
  at: string;
  by: string;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class NegotiationsService {
  private api = environment.apiUrl;
  private _list$ = new BehaviorSubject<NegotiationSummary[]>([]);
  list$ = this._list$.asObservable();

  constructor(private http: HttpClient) {}

  listMine(userId: string): Observable<NegotiationSummary[]> {
    return this.http
      .get<{ negotiations?: any[] } | any[]>(`${this.api}/negotiations/user/${userId}`)
      .pipe(
        map((res) => {
          const raw = Array.isArray(res) ? res : res?.negotiations ?? [];
          return raw.map(this.toSummary);
        }),
        tap((list) => this._list$.next(list ?? []))
      );
  }

  getById(id: string): Observable<NegotiationDetail> {
    return this.http
      .get<any>(`${this.api}/negotiations/${id}`)
      .pipe(
        map(res => this.toDetail(res?.negotiation ?? res)),
        tap(detail => this.patchInList(detail))
      );
  }

  createFromCartGroups(groups: CartGroupPayload[], whoFirst: 'buyer'|'seller') {
    return this.http.post<Negotiation[]>(`${this.api}/negotiations`, { groups, whoFirst }).pipe(
      tap(created => {
        if (Array.isArray(created) && created.length) {
          const summaries = created.map(this.toSummary);
          this._list$.next([...this._list$.value, ...summaries]);
        }
      })
    );
  }

  accept(id: string) {
    return this.http.patch<Negotiation>(`${this.api}/negotiations/${id}/accept`, {}).pipe(
      tap(updated => this.patchInList(updated))
    );
  }

  markPaid(id: string, body: { method: 'PIX'|'TED'|'BOLETO'; comprovanteImage?: string }) {
    return this.http.patch<Negotiation>(`${this.api}/negotiations/${id}/mark-paid`, body).pipe(
      tap(updated => this.patchInList(updated))
    );
  }

  markShipped(id: string, body: { carrier?: string; trackingCode?: string; proofImage?: string }) {
    return this.http.patch<Negotiation>(`${this.api}/negotiations/${id}/mark-shipped`, body).pipe(
      tap(updated => this.patchInList(updated))
    );
  }

  private patchInList(updated: Negotiation | NegotiationSummary | NegotiationDetail | null | undefined): void {
    if (!updated?.id) return;
    const summary = this.toSummary(updated as any);
    const curr = this._list$.value;
    const idx = curr.findIndex(n => n.id === summary.id);
    if (idx === -1) return;
    const next = [...curr];
    next[idx] = summary;
    this._list$.next(next);
  }

  private toSummary = (raw: any): NegotiationSummary => {
    if (!raw) {
      return {
        id: '',
        createdAt: '',
        totalPrice: 0,
        evaluated: false,
        status: null,
        buyer: { id: '', nome: '' },
        seller: { id: '', nome: '' },
        listings: []
      };
    }

    const buyer = this.normalizeParty(raw.buyerId ?? raw.buyer ?? {});
    const seller = this.normalizeParty(raw.sellerId ?? raw.seller ?? {});

    const listingsSource = raw.listingsId ?? raw.listings ?? [];
    const listings: ListingSummary[] = Array.isArray(listingsSource)
      ? listingsSource.map((item: any) => {
          const snap = item.bookSnapshot ?? {};
          return {
            id: item._id ?? item.id ?? '',
            title: snap.title ?? item.title ?? '',
            author: snap.author ?? item.author ?? '',
            price: Number(item.price) || 0,
            condition: item.condition ?? null,
            shipping: item.shipping ?? null,
            image: snap.image ?? snap.imageUrl ?? snap.cover ?? null
          };
        })
      : [];

    const status = this.deriveStatus(raw);

    return {
      id: raw._id ?? raw.id ?? '',
      createdAt: raw.date ?? raw.createdAt ?? '',
      totalPrice: Number(raw.price) || listings.reduce((sum, l) => sum + (l.price ?? 0), 0),
      evaluated: !!raw.isEvaluated,
      status,
      buyer,
      seller,
      listings
    };
  };

  private toDetail = (raw: any): NegotiationDetail => {
    const summary = this.toSummary(raw);

    const items: NegotiationItemDetail[] = summary.listings.map((listing) => ({
      id: listing.id,
      titulo: listing.title,
      autor: listing.author ?? '',
      preco: listing.price,
      quantidade: 1,
      condicao: listing.condition ?? null,
      shipping: listing.shipping ?? null,
      image: listing.image ?? null
    }));

    const logs: NegotiationLogDetail[] = Array.isArray(raw.logs)
      ? raw.logs.map((log: any) => ({
          at: log.at ?? log.createdAt ?? log.date ?? new Date().toISOString(),
          by: log.by ?? log.author ?? 'sistema',
          message: log.message ?? log.text ?? ''
        }))
      : [];

    const paymentRaw = raw.payment ?? raw.pagamento ?? null;
    const shipmentRaw = raw.shipment ?? raw.envio ?? null;

    const payment: PaymentDetail | null = paymentRaw
      ? {
          method: paymentRaw.method ?? paymentRaw.metodo ?? null,
          paidAt: paymentRaw.paidAt ?? paymentRaw.data ?? null,
          comprovanteImage: paymentRaw.comprovanteImage ?? paymentRaw.comprovante ?? null
        }
      : null;

    const shipment: ShipmentDetail | null = shipmentRaw
      ? {
          carrier:
            shipmentRaw.carrier ??
            shipmentRaw.transportadora ??
            raw.shipping?.carrier ??
            raw.shipping?.transportadora ??
            null,
          trackingCode:
            shipmentRaw.trackingCode ??
            shipmentRaw.codigo ??
            raw.shipping?.trackingCode ??
            raw.shipping?.codigo ??
            null,
          sentAt:
            shipmentRaw.sentAt ??
            shipmentRaw.data ??
            raw.shipping?.sentAt ??
            raw.shipping?.data ??
            null,
          proofImage:
            shipmentRaw.proofImage ??
            shipmentRaw.comprovanteImage ??
            shipmentRaw.comprovante ??
            raw.shipping?.proofImage ??
            raw.shipping?.comprovanteImage ??
            raw.shipping?.comprovante ??
            null
        }
      : raw.shipping
      ? {
          carrier: raw.shipping.carrier ?? raw.shipping.transportadora ?? null,
          trackingCode: raw.shipping.trackingCode ?? raw.shipping.codigo ?? null,
          sentAt: raw.shipping.sentAt ?? raw.shipping.data ?? null,
          proofImage: raw.shipping.proofImage ?? raw.shipping.comprovanteImage ?? raw.shipping.comprovante ?? null
        }
      : null;

    const trackingSources: any[] = [
      shipment?.trackingCode ?? null,
      ...(Array.isArray(raw.trackingCodes) ? raw.trackingCodes : []),
      ...(Array.isArray(raw.shipments) ? raw.shipments.map((s: any) => s.trackingCode ?? s.codigo ?? null) : [])
    ];
    const trackingCodes = trackingSources.filter((value): value is string => !!value);

    return {
      ...summary,
      items,
      logs,
      payment,
      shipment,
      trackingCodes,
      status: this.deriveStatus(raw),
      whoFirst: raw.whoFirst ?? null,
      acceptedAt: raw.acceptedAt ?? null,
      buyerDeadline: raw.buyerDeadline ?? null,
      sellerDeadline: raw.sellerDeadline ?? null
    };
  };

  private normalizeParty(raw: any): PartySummary {
    if (!raw) return { id: '', nome: '' };

    const id = raw._id ?? raw.id ?? '';
    const nome =
      [raw.name, raw.lastname].filter(Boolean).join(' ') ||
      raw.nome ||
      raw.fullName ||
      '';

    const cidade =
      raw.address?.cidade ??
      raw.address?.city ??
      raw.cidade ??
      raw.city ??
      null;
    const estado =
      raw.address?.estado ??
      raw.address?.state ??
      raw.estado ??
      raw.state ??
      null;
    const email = raw.email ?? raw.mail ?? null;

    return { id, nome, cidade, estado, email };
  }

  private deriveStatus(raw: any): string {
    if (raw?.status) return raw.status;

    const evaluatedStatus =
      raw?.isEvaluated === true ? 'COMPLETED' : raw?.isEvaluated === false ? null : null;

    const paymentDone = !!(
      raw?.payment?.paidAt ||
      raw?.paymentDate ||
      raw?.payment_at ||
      raw?.payProof ||
      raw?.paidAt
    );

    const shipmentDone = !!(
      raw?.shipment?.sentAt ||
      raw?.shipmentDate ||
      raw?.shipping?.sentAt ||
      raw?.shipProof ||
      raw?.trackingCode
    );

    if (evaluatedStatus === 'COMPLETED') return 'COMPLETED';
    if (shipmentDone) return 'COMPLETED';
    if (paymentDone) return 'WAITING_SELLER';
    return 'WAITING_BUYER';
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