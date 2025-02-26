import { Component, OnInit } from '@angular/core';
import { NavbarMenuComponent } from "../../components/navbar-menu/navbar-menu.component";

@Component({
  selector: 'app-home',
  imports: [NavbarMenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
