import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar-menu',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-menu.component.html',
  styleUrl: './navbar-menu.component.css'
})
export class NavbarMenuComponent implements OnInit{

  constructor(public cart: CartService) {}

  ngOnInit(): void {
  }

}
