// src/app/pages/negotiation-detail/negotiation-detail.component.ts
import {
  CommonModule,
  DatePipe,
  DecimalPipe,
  NgFor,
  NgIf
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Negotiation } from '../../models/api.models';
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { NegotiationsService } from '../../services/negotiations.service';

@Component({
  selector: 'app-negotiation-detail',
  standalone: true,
  imports: [
    CommonModule, NgIf, NgFor,
    FormsModule, DatePipe, DecimalPipe,
    RouterLink, StatusLabelPipe
  ],
  templateUrl: './negotiation-detail.component.html',
  styleUrls: ['./negotiation-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private negSvc = inject(NegotiationsService);

  // ⚠️ Trocar quando integrar autenticação real
  private currentUserId = 'me';

  // Inputs dos formulários de ação
  carrier = '';
  tracking = '';
  method: 'PIX' | 'TED' | 'BOLETO' = 'PIX';
  proof = '';

  // Writable Signal da negociação (permite .set)
  neg = signal<Negotiation | null>(null);

  // Papel do usuário na negociação
  isSeller = computed(() => {
    const n = this.neg(); return !!n && n.seller.id === this.currentUserId;
  });
  isBuyer = computed(() => {
    const n = this.neg(); return !!n && n.buyer.id === this.currentUserId;
  });

  // Ticker para countdown (atualiza a cada 60s)
  private timer!: any;
  now = signal(Date.now());

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    // Carrega a negociação e injeta no signal
    this.negSvc.getById(id).subscribe(n => this.neg.set(n));

    // Atualiza relógio a cada minuto (para os contadores)
    this.timer = setInterval(() => this.now.set(Date.now()), 60_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  // -------- Helpers de prazo --------
  private formatDiff(target?: Date | string | null): string | null {
    if (!target) return null;
    const t = new Date(target).getTime();
    const diffMs = t - this.now(); // pode ser negativo
    const abs = Math.abs(diffMs);

    const days = Math.floor(abs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((abs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const label = `${days}d ${hours}h`;

    return diffMs >= 0 ? `${label} restantes` : `expirou há ${label}`;
  }

  buyerCountdown = computed(() => this.formatDiff(this.neg()?.buyerDeadline ?? null));
  sellerCountdown = computed(() => this.formatDiff(this.neg()?.sellerDeadline ?? null));

  // -------- Ações --------
  accept(id: string) {
    if (!this.isSeller()) return;
    this.negSvc.accept(id).subscribe(n => this.neg.set(n));
  }

  markPaid(id: string) {
    if (!this.isBuyer()) return;
    this.negSvc
      .markPaid(id, { method: this.method, comprovanteUrl: this.proof })
      .subscribe(n => this.neg.set(n));
  }

  markShipped(id: string) {
    if (!this.isSeller()) return;
    this.negSvc
      .markShipped(id, { carrier: this.carrier, trackingCode: this.tracking })
      .subscribe(n => this.neg.set(n));
  }
}
