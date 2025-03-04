import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-menu',
  imports: [RouterLink],
  templateUrl: './navbar-menu.component.html',
  styleUrl: './navbar-menu.component.css'
})
export class NavbarMenuComponent implements OnInit{

  constructor() { }

  ngOnInit(): void {
  }

}
