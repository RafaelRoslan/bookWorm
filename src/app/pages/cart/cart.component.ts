import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem, CartService } from '../../services/cart.service';
import { NegotiationsService } from '../../services/negotiations.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  private cart = inject(CartService);
  private router = inject(Router);
  private negotiations = inject(NegotiationsService);

  // getters para usar com async pipe no template
  get items$() { return this.cart.items$; }
  get total$() { return this.cart.total$; }

  remove(id: string) { this.cart.remove(id); }
  clear() { this.cart.clear(); }
  groups() { return this.cart.groupBySeller(); }
  trackById(_i: number, it: CartItem) { return it.id; }

  checkout() {
    const groups = this.cart.groupBySeller().map(g => ({
      seller: { id: g.seller.id, nome: g.seller.nome },
      buyer:  { id: 'me', nome: 'Usuário Atual' }, // TODO: trocar por usuário autenticado
      items:  g.items.map(it => ({
        offerId: it.id,
        titulo: it.titulo,
        autor: it.autor,
        condicao: it.estado,
        preco: it.preco,
        quantidade: 1
      }))
    }));

    if (!groups.length) return;

    // quem faz primeiro pode vir de UI; por enquanto fixo 'buyer'
    this.negotiations.createFromCartGroups(groups, 'buyer').subscribe({
      next: (created) => {
        this.cart.clear();
        if (!created || created.length === 0) return;
        if (created.length === 1) {
          this.router.navigate(['/negociacoes', created[0].id]);
        } else {
          this.router.navigate(['/negociacoes']);
        }
      },
      error: (err) => {
        console.error('Falha ao criar negociação', err);
        // TODO: exibir toast/alert no UI
      }
    });
  }
}
