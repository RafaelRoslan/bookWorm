export type PartyRef = {
  id: string;
  nome: string;
};

export type NegotiationItem = {
  offerId: string;
  titulo: string;
  autor?: string;
  condicao?: string;
  preco: number;
  quantidade: number; // normalmente 1
};

export type NegotiationStatus =
  | 'PENDING_SELLER_ACCEPT'  // aguardando o vendedor aceitar
  | 'ACTIVE'                 // aceita, em andamento
  | 'WAITING_BUYER'          // aceita e quem faz primeiro é o comprador (pagamento)
  | 'WAITING_SELLER'         // comprador já pagou; aguardando vendedor postar
  | 'COMPLETED'              // concluída
  | 'CANCELLED'              // cancelada manualmente
  | 'EXPIRED';               // estourou prazo

export type WhoFirst = 'buyer' | 'seller';

export type PaymentInfo = {
  method?: 'PIX' | 'TED' | 'BOLETO';
  pixChave?: string;
  comprovanteUrl?: string;
  paidAt?: string; // ISO
};

export type ShipmentInfo = {
  carrier?: string;
  trackingCode?: string;
  sentAt?: string; // ISO
};

export type NegotiationLog = {
  at: string;  // ISO
  by: 'buyer' | 'seller' | 'system';
  message: string;
};

export type Negotiation = {
  id: string;
  buyer: PartyRef;
  seller: PartyRef;
  items: NegotiationItem[];

  totalItens: number;
  totalPrice: number;

  status: NegotiationStatus;
  whoFirst: WhoFirst;

  createdAt: string;   // ISO
  acceptedAt?: string; // ISO
  buyerDeadline?: string;  // ISO (7d após acceptedAt se buyer first, ou após acceptedAt seller-first invertendo)
  sellerDeadline?: string; // ISO (7d após buyer pagar, ou acceptedAt se seller first)

  payment?: PaymentInfo;
  shipment?: ShipmentInfo;

  logs: NegotiationLog[];
};
