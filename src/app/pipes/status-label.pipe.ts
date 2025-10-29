import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'PENDING_SELLER_ACCEPT': return 'Aguardando aceite';
      case 'ACTIVE':                return 'Em negociação';
      case 'WAITING_BUYER':         return 'Aguardando comprador';
      case 'WAITING_SELLER':        return 'Aguardando vendedor';
      case 'COMPLETED':             return 'Finalizada';
      case 'CANCELLED':             return 'Cancelada';
      case 'EXPIRED':               return 'Expirada';
      default:                      return status;
    }
  }
}
