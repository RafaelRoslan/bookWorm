import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem, CartService } from '../../services/cart.service';
import { NegotiationsService } from '../../services/negotiations.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/api.models';

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
  private auth = inject(AuthService);

  // getters para usar com async pipe no template
  get items$() { return this.cart.items$; }
  get total$() { return this.cart.total$; }

  remove(id: string) { this.cart.remove(id); }
  clear() { this.cart.clear(); }
  groups() { return this.cart.groupBySeller(); }
  trackById(_i: number, it: CartItem) { return it.id; }
  decrease(item: CartItem) {
    if (!this.canDecrease(item)) return;
    const current = item.qty ?? 1;
    this.cart.updateQuantity(item.id, current - 1);
  }

  increase(item: CartItem) {
    if (!this.canIncrease(item)) return;
    const current = item.qty ?? 1;
    this.cart.updateQuantity(item.id, current + 1);
  }

  canIncrease(item: CartItem): boolean {
    if (item.stock != null) return (item.qty ?? 1) < item.stock;
    return true;
  }

  canDecrease(item: CartItem): boolean {
    return (item.qty ?? 1) > 1;
  }

  checkout() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.auth.currentUser;
    if (user) {
      this.createNegotiations(user);
    } else {
      this.auth.loadMe().subscribe({
        next: (loaded) => {
          if (loaded) {
            this.createNegotiations(loaded);
          } else {
            console.error('Não foi possível obter o usuário autenticado.');
          }
        },
        error: (err) => {
          console.error('Falha ao carregar usuário autenticado', err);
        }
      });
    }
  }

  private createNegotiations(user: User) {
    const groups = this.cart.groupBySeller().map(g => ({
      seller: { id: g.seller.id, nome: g.seller.nome },
      buyer:  { id: user.id, nome: user.name },
      items:  g.items.map(it => ({
        offerId: it.id,
        titulo: it.titulo,
        autor: it.autor,
        condicao: it.estado,
        preco: it.preco,
        quantidade: it.qty ?? 1
      }))
    }));

    if (!groups.length) return;

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
      }
    });
  }
}
