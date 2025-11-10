import { CommonModule, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { NegotiationsService, NegotiationSummary } from '../../services/negotiations.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  rows$ = this.negSvc.list$.pipe(
    map(list => (Array.isArray(list) ? list : []).map(n => this.toRow(n)))
  );

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) return;

    const user = this.auth.currentUser;
    if (user?.id) {
      this.currentUserId = user.id;
      this.negSvc.listMine(user.id).subscribe();
      return;
    }

    this.auth.loadMe().subscribe({
      next: (loaded) => {
        if (loaded?.id) {
          this.currentUserId = loaded.id;
          this.negSvc.listMine(loaded.id).subscribe();
        }
      },
      error: (err) => console.error('Falha ao buscar usuário para listar negociações', err)
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

    const tracking = this.resolveTracking(n);
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
    const status = n.status ?? (n.evaluated ? 'COMPLETED' : null);
    switch (status) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'CANCELLED':
        return 'CANCELLED';
      case 'WAITING_BUYER':
      case 'WAITING_SELLER':
      case 'ACTIVE':
        return status;
      default:
        return n.evaluated ? 'COMPLETED' : 'ACTIVE';
    }
  }

  private resolveLocation(party?: { cidade?: string | null; estado?: string | null }): string {
    if (!party) return '—';
    const parts = [party.cidade, party.estado].filter(Boolean);
    return parts.length ? parts.join(' / ') : '—';
  }

  private resolveTracking(n: NegotiationSummary): string {
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