export interface User {
  _id: string;               // padronize _id
  name: string;
  lastname: string;
  email: string;
  status?: 'ativo' | 'inativo';
  address?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    complemento?: string;
    cidade?: string;
    estado?: string;
  };
  bankDetails?: {
    conta?: string;
    agencia?: string;
    tipoConta?: string;
    titular?: string;
    cpfTitular?: string;
  };
  pix?: { chave?: string };
}

export interface Collection {
  id: string;
  name: string;
  image?: string;
  description?: string;
  userId: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year?: number;
  status?: string;
  imageUrl?: string;
  collectionId: string;
  description?: string;
  isbn?: string;
}

export interface Offer {
  id: string;
  titulo: string;
  autor: string;
  capa?: string;
  preco: number;
  estado: string;
  vendedor: { id: string; nome: string; reputacao?: number; cidade?: string };
  dataPublicacao: string; // ISO
}

export type NegotiationStatus =
  | 'PENDING_SELLER_ACCEPT'
  | 'WAITING_BUYER'
  | 'WAITING_SELLER'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface NegotiationItem {
  offerId: string;
  titulo: string;
  autor: string;
  quantidade: number;
  preco: number;
  condicao?: string;
}

export interface Negotiation {
  id: string;
  seller: { id: string; nome: string };
  buyer:  { id: string; nome: string };
  status: NegotiationStatus;
  items: NegotiationItem[];
  totalPrice: number;
  whoFirst: 'buyer' | 'seller';
  createdAt: string;
  acceptedAt?: string;
  buyerDeadline?: string;
  sellerDeadline?: string;
  payment?: { paidAt: string; method: 'PIX'|'TED'|'BOLETO'; comprovanteUrl?: string };
  shipment?: { sentAt: string; carrier?: string; trackingCode?: string };
  logs: { at: string; by: string; message: string }[];
}

export interface Collection {
  _id: string;
  name: string;
  userId: string;
  coverImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  _id: string;
  collectionId: string;
  title: string;
  author: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}