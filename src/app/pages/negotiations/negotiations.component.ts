import { CommonModule, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { AuthService } from '../../services/auth.service';
import { NegotiationsService, NegotiationSummary } from '../../services/negotiations.service';

@Component({
  selector: 'app-negotiations',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor,
    DecimalPipe, DatePipe,
    RouterLink,          // <== necessário para [routerLink]
    StatusLabelPipe      // <== nosso pipe custom
  ],
  templateUrl: './negotiations.component.html',
  styleUrls: ['./negotiations.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationsComponent implements OnInit {
  private negSvc = inject(NegotiationsService);
  private auth = inject(AuthService);
  private router = inject(Router);

  private currentUserId: string | null = null;

  loading = signal(false);
  error = signal('');

  rows$ = this.negSvc.list$.pipe(
    map(list => (Array.isArray(list) ? list : []).map(n => this.toRow(n)))
  );

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.error.set('Você precisa estar autenticado para ver suas negociações');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const user = this.auth.currentUser;
    if (user?._id) {
      this.currentUserId = user._id;
      this.loadNegotiations(user._id);
      return;
    }

    this.auth.loadMe().subscribe({
      next: (loaded) => {
        if (loaded?._id) {
          this.currentUserId = loaded._id;
          this.loadNegotiations(loaded._id);
        } else {
          this.loading.set(false);
          this.error.set('Não foi possível carregar seus dados');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Falha ao buscar usuário para listar negociações');
        console.error('Falha ao buscar usuário para listar negociações', err);
      }
    });
  }

  private loadNegotiations(userId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.negSvc.listMine(userId).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Falha ao carregar negociações');
        console.error('Erro ao carregar negociações', err);
      }
    });
  }

  open(id: string): void {
    this.router.navigate(['/negociacoes', id]);
  }

  private toRow(n: NegotiationSummary): NegotiationRow {
    const userId = this.currentUserId;
    const isBuyer = !!userId && n.buyer?.id === userId;
    const counterparty = isBuyer ? n.seller : n.buyer;

    const actions = this.buildActions(n, isBuyer);

    // Busca tracking do raw data (n pode ter campos extras do backend)
    const tracking = this.resolveTracking(n as any);
    const zip = this.resolveLocation(isBuyer ? n.buyer : n.seller);

    return {
      id: n.id,
      idShort: n.id?.slice(0, 8) ?? '',
      createdAt: n.createdAt,
      counterpartName: counterparty?.nome ?? '—',
      roleChip: isBuyer ? 'B' : 'V',
      actions,
      total: n.totalPrice ?? 0,
      status: this.resolveStatus(n),
      zip,
      tracking
    };
  }

  private buildActions(n: NegotiationSummary, isBuyer: boolean): string[] {
    const actions: string[] = [];

    const paymentDone = !!(n as any)?.payment?.paidAt || !!(n as any)?.paidAt || !!(n as any)?.paymentDone;
    const shipmentDone = !!(n as any)?.shipment?.sentAt || !!(n as any)?.shipProof || !!(n as any)?.shipmentDone;

    if (paymentDone) actions.push(isBuyer ? 'Eu paguei' : 'Ele pagou');
    if (shipmentDone) actions.push(isBuyer ? 'Ele enviou' : 'Eu enviei');
    if (n.evaluated) actions.push(isBuyer ? 'Eu avaliei' : 'Ele avaliou');
    if (n.listings?.length) {
      const shippings = Array.from(new Set(n.listings.map(l => l.shipping).filter(Boolean)));
      shippings.forEach(ship => actions.push(`Envio: ${ship}`));
    }

    if (!actions.length) actions.push('—');

    return actions;
  }

  private resolveStatus(n: NegotiationSummary): string {
    // Usa o status do backend diretamente se existir
    if (n.status) {
      const status = String(n.status).toLowerCase();
      // Normaliza os status do backend
      if (status === 'esperando_pagamento') return 'esperando_pagamento';
      if (status === 'aguardando_envio') return 'aguardando_envio';
      if (status === 'encaminhada') return 'encaminhada';
      if (status === 'concluido' || status === 'concluído') return 'concluido';
      // Retorna o status original se não for um dos novos
      return n.status;
    }
    
    // Fallback: deriva status baseado em evaluated
    return n.evaluated ? 'concluido' : 'esperando_pagamento';
  }

  private resolveLocation(party?: { cidade?: string | null; estado?: string | null }): string {
    if (!party) return '—';
    const parts = [party.cidade, party.estado].filter(Boolean);
    return parts.length ? parts.join(' / ') : '—';
  }

  private resolveTracking(n: NegotiationSummary): string {
    // Tenta buscar do shipment da negociação
    const shipmentTracking = (n as any)?.shipment?.trackingCode ?? 
                            (n as any)?.shipment?.codigo ??
                            (n as any)?.trackingCode ??
                            null;
    
    if (shipmentTracking) return shipmentTracking;
    
    // Tenta buscar de trackingCodes (array)
    const trackingCodes = (n as any)?.trackingCodes;
    if (Array.isArray(trackingCodes) && trackingCodes.length > 0) {
      return trackingCodes[0];
    }
    
    // Tenta buscar de shipments (array)
    const shipments = (n as any)?.shipments;
    if (Array.isArray(shipments) && shipments.length > 0) {
      const firstShipment = shipments[0];
      return firstShipment?.trackingCode ?? firstShipment?.codigo ?? null;
    }
    
    // Fallback: tenta buscar dos listings (compatibilidade)
    const first = n.listings?.[0];
    const tracking =
      (first as any)?.trackingCode ??
      (first as any)?.tracking ??
      (first as any)?.shipment?.trackingCode ??
      null;
    
    return tracking || '—';
  }

}

type NegotiationRow = {
  id: string;
  idShort: string;
  createdAt: string;
  counterpartName: string;
  roleChip: 'B' | 'V';
  actions: string[];
  total: number;
  status: string;
  zip: string;
  tracking: string;
};