import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    if (!status) return '';
    
    const normalized = status.toLowerCase();
    
    switch (normalized) {
      // Status do backend
      case 'esperando_pagamento': return 'Esperando pagamento';
      case 'aguardando_envio':   return 'Aguardando envio';
      case 'encaminhada':         return 'Encaminhada';
      case 'concluido':
      case 'concluído':           return 'Concluída';
      
      // Status antigos (compatibilidade)
      case 'pending_seller_accept': return 'Aguardando aceite';
      case 'active':                return 'Em negociação';
      case 'waiting_buyer':         return 'Aguardando comprador';
      case 'waiting_seller':        return 'Aguardando vendedor';
      case 'completed':             return 'Finalizada';
      case 'cancelled':             return 'Cancelada';
      case 'expired':               return 'Expirada';
      
      default:                      return status;
    }
  }
}
