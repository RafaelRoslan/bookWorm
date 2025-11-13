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
import { StatusLabelPipe } from '../../pipes/status-label.pipe';
import { AuthService } from '../../services/auth.service';
import { NegotiationDetail, NegotiationsService } from '../../services/negotiations.service';

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
  private auth = inject(AuthService);

  // ⚠️ Trocar quando integrar autenticação real
  private currentUserId: string | null = null;

  // Inputs dos formulários de ação
  carrier = '';
  tracking = '';
  method: 'PIX' | 'TED' | 'BOLETO' = 'PIX';
  proof = '';
  shipmentProof = '';
  paymentPreview: string | null = null;
  shipmentPreview: string | null = null;
  paymentProofError = '';
  shipmentProofError = '';
  viewProofOpen = false;
  proofModalImage: string | null = null;
  proofModalTitle = '';
  actionFormOpen = false;
  actionType: 'payment' | 'shipment' | null = null;
  commentOpen = false;
  commentText = '';
  commentError = '';
  reportOpen = false;
  reportReason = '';
  reportAccusedId = '';
  reportAttachments: string[] = [];
  reportError = '';
  loadingComment = false;
  loadingReport = false;
  loadingReceived = false;

  // Writable Signal da negociação (permite .set)
  neg = signal<NegotiationDetail | null>(null);

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

    const user = this.auth.currentUser;
    if (user?._id) {
      this.currentUserId = user._id;
      this.loadDetail(id);
    } else {
      this.auth.loadMe().subscribe(u => {
        this.currentUserId = u?._id ?? null;
        this.loadDetail(id);
      });
    }

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
    this.negSvc.accept(id).subscribe(() => this.loadDetail(id));
  }

  markPaid(id: string) {
    if (!this.isBuyer()) return;
    this.paymentProofError = '';
    if (!this.proof) {
      this.paymentProofError = 'Anexe o comprovante de pagamento';
      return;
    }
    this.negSvc
      .markPaid(id, { method: this.method, comprovanteImage: this.proof })
      .subscribe(() => this.loadDetail(id));
    this.actionFormOpen = false;
    this.actionType = null;
    this.proof = '';
    this.paymentPreview = null;
    this.paymentProofError = '';
    this.method = 'PIX';
  }

  markShipped(id: string) {
    if (!this.isSeller()) return;
    this.shipmentProofError = '';
    if (!this.tracking) {
      this.shipmentProofError = 'Informe o código de rastreio';
      return;
    }
    if (!this.shipmentProof) {
      this.shipmentProofError = 'Anexe o comprovante de postagem';
      return;
    }
    this.negSvc
      .markShipped(id, { carrier: this.carrier, trackingCode: this.tracking, proofImage: this.shipmentProof })
      .subscribe(() => this.loadDetail(id));
    this.actionFormOpen = false;
    this.actionType = null;
    this.carrier = '';
    this.tracking = '';
    this.shipmentProof = '';
    this.shipmentPreview = null;
    this.shipmentProofError = '';
  }

  private loadDetail(id: string): void {
    this.negSvc.getById(id).subscribe(detail => this.neg.set(detail));
  }

  roleLabel(): string {
    if (this.isSeller()) return 'Vendedor';
    if (this.isBuyer()) return 'Comprador';
    return 'Participante';
  }

  counterparty(n: NegotiationDetail) {
    return this.isBuyer() ? n.seller : n.buyer;
  }

  hasPayment(n: NegotiationDetail): boolean {
    return !!(n.payment?.method || n.payment?.paidAt || n.payment?.comprovanteImage);
  }

  hasShipment(n: NegotiationDetail): boolean {
    return !!(n.shipment?.carrier || n.shipment?.trackingCode || n.shipment?.sentAt || (n.trackingCodes?.length ?? 0));
  }

  trackingList(n: NegotiationDetail): string[] {
    return (n.trackingCodes ?? []).filter((code): code is string => typeof code === 'string');
  }

  getTrackingCode(n: NegotiationDetail): string | null {
    // Prioriza o código principal do shipment
    if (n.shipment?.trackingCode) return n.shipment.trackingCode;
    
    // Se não tiver, pega o primeiro do array de trackingCodes
    const codes = this.trackingList(n);
    if (codes.length > 0) return codes[0];
    
    return null;
  }

  getPaymentStatus(n: NegotiationDetail): string {
    if (n.payment?.paidAt) {
      return 'Pago';
    }
    if (n.payment?.method) {
      return 'Aguardando confirmação';
    }
    return 'Aguardando pagamento';
  }

  getCommentAuthorName(comment: any): string {
    // Nova estrutura: authorId com name e lastname
    if (comment.authorId) {
      const name = comment.authorId.name || '';
      const lastname = comment.authorId.lastname || '';
      const fullName = `${name} ${lastname}`.trim();
      if (fullName) return fullName;
    }
    
    // Estrutura antiga: author.name
    if (comment.author?.name) {
      return comment.author.name;
    }
    
    return 'Usuário';
  }

  getCommentAuthorInitial(comment: any): string {
    const name = this.getCommentAuthorName(comment);
    return name[0]?.toUpperCase() || 'U';
  }

  canMarkReceived(n: NegotiationDetail | null): boolean {
    if (!n || !this.isBuyer()) return false;
    
    // Não mostra se já está concluído
    const status = (n.status || '').toLowerCase();
    if (status === 'concluido' || status === 'concluído' || n.evaluated) return false;
    
    // Pode marcar como recebido se:
    // - Já foi enviado (tem shipment)
    // - Status é "encaminhada" ou tem tracking code
    const hasShipment = this.hasShipment(n);
    const isEncaminhada = status === 'encaminhada';
    return hasShipment && (isEncaminhada || !!n.shipment?.trackingCode);
  }

  markReceived(id: string): void {
    if (!this.isBuyer()) return;
    
    this.loadingReceived = true;
    this.negSvc.markReceived(id).subscribe({
      next: () => {
        this.loadingReceived = false;
        this.loadDetail(id);
      },
      error: (err) => {
        this.loadingReceived = false;
        console.error('Erro ao marcar produto como recebido', err);
        // Você pode adicionar uma mensagem de erro aqui se quiser
      }
    });
  }

  openAction(type: 'payment' | 'shipment'): void {
    if (this.actionType === type) {
      this.actionFormOpen = !this.actionFormOpen;
    } else {
      this.actionFormOpen = true;
    }
    this.actionType = this.actionFormOpen ? type : null;
    if (!this.actionFormOpen) this.resetFormState();
  }

  toggleComment(): void {
    this.commentOpen = !this.commentOpen;
    if (!this.commentOpen) this.commentText = '';
  }

  submitComment(): void {
    const text = this.commentText.trim();
    const negId = this.neg()?.id;
    if (!text || !negId) {
      this.commentError = 'Digite uma mensagem';
      return;
    }
    
    this.commentError = '';
    this.loadingComment = true;
    
    this.negSvc.addComment(negId, { message: text }).subscribe({
      next: () => {
        this.commentText = '';
        this.commentOpen = false;
        this.loadingComment = false;
        this.loadDetail(negId);
      },
      error: (err) => {
        this.commentError = err?.error?.message || 'Erro ao enviar comentário';
        this.loadingComment = false;
      }
    });
  }

  openReport(): void {
    const n = this.neg();
    if (!n) return;
    this.reportOpen = true;
    this.reportReason = '';
    this.reportAccusedId = this.isBuyer() ? n.seller.id : n.buyer.id;
    this.reportAttachments = [];
    this.reportError = '';
  }

  closeReport(): void {
    this.reportOpen = false;
    this.reportReason = '';
    this.reportAccusedId = '';
    this.reportAttachments = [];
    this.reportError = '';
  }

  submitReport(): void {
    const negId = this.neg()?.id;
    const reason = this.reportReason.trim();
    
    if (!reason) {
      this.reportError = 'Informe o motivo da denúncia';
      return;
    }
    
    if (!negId) {
      this.reportError = 'Negociação não encontrada';
      return;
    }
    
    this.reportError = '';
    this.loadingReport = true;
    
    const body: any = {
      reason,
      attachments: this.reportAttachments.length > 0 ? this.reportAttachments : undefined
    };
    
    if (this.reportAccusedId) {
      body.accusedId = this.reportAccusedId;
    }
    
    this.negSvc.createReport(negId, body).subscribe({
      next: () => {
        this.closeReport();
        this.loadingReport = false;
        this.loadDetail(negId);
      },
      error: (err) => {
        this.reportError = err?.error?.message || 'Erro ao criar denúncia';
        this.loadingReport = false;
      }
    });
  }

  closeAction(): void {
    this.actionFormOpen = false;
    this.actionType = null;
    this.resetFormState();
  }

  buyerMustAct(n: NegotiationDetail | null): boolean {
    if (!n) return false;
    if (!this.isBuyer()) return false;
    // Comprador deve agir quando status é "esperando_pagamento" ou não há pagamento
    const status = (n.status || '').toLowerCase();
    return status === 'esperando_pagamento' || !this.hasPayment(n);
  }

  sellerMustAct(n: NegotiationDetail | null): boolean {
    if (!n) return false;
    if (!this.isSeller()) return false;
    // Vendedor deve agir quando status é "aguardando_envio" (pagamento feito, aguardando envio)
    const status = (n.status || '').toLowerCase();
    return status === 'aguardando_envio' || (this.hasPayment(n) && !this.hasShipment(n));
  }

  onPaymentProofSelected(event: Event): void {
    this.paymentProofError = '';
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.paymentProofError = 'Selecione uma imagem (JPG, PNG, etc.)';
      return;
    }
    this.fileToBase64(file).then(base64 => {
      this.proof = base64;
      this.paymentPreview = base64;
    }).catch(() => {
      this.paymentProofError = 'Não foi possível ler o arquivo.';
    });
  }

  onShipmentProofSelected(event: Event): void {
    this.shipmentProofError = '';
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.shipmentProofError = 'Selecione uma imagem (JPG, PNG, etc.)';
      return;
    }
    this.fileToBase64(file).then(base64 => {
      this.shipmentProof = base64;
      this.shipmentPreview = base64;
    }).catch(() => {
      this.shipmentProofError = 'Não foi possível ler o arquivo.';
    });
  }

  private resetFormState(): void {
    this.paymentProofError = '';
    this.shipmentProofError = '';
    this.paymentPreview = null;
    this.shipmentPreview = null;
    this.proof = '';
    this.shipmentProof = '';
    this.carrier = '';
    this.tracking = '';
    this.method = 'PIX';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  openProofModal(image: string | null, title: string): void {
    if (!image) return;
    this.proofModalImage = image;
    this.proofModalTitle = title;
    this.viewProofOpen = true;
  }

  closeProofModal(): void {
    this.viewProofOpen = false;
    this.proofModalImage = null;
    this.proofModalTitle = '';
  }
}
