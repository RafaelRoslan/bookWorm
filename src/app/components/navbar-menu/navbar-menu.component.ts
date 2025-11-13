import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar-menu.component.html',
  styleUrl: './navbar-menu.component.css'
})
export class NavbarMenuComponent {
  accountOpen = false;

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private router: Router,
    private el: ElementRef<HTMLElement>
  ) {}

  isAuth(): boolean {
    return this.auth.isAuthenticated();
  }

  toggleAccount(): void {
    this.accountOpen = !this.accountOpen;
  }

  closeAccount(): void {
    this.accountOpen = false;
  }

  onLogout(): void {
    this.auth.logout();
    this.closeAccount();
    this.router.navigate(['']);
  }

  // Fecha dropdown clicando fora
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as Node;
    if (!this.el.nativeElement.contains(target)) {
      this.accountOpen = false;
    }
  }

  // Acessibilidade básica com ESC
  @HostListener('document:keydown.escape')
  onEsc() {
    this.accountOpen = false;
  }
}
