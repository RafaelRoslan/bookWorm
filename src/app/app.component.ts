import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarMenuComponent } from "./components/navbar-menu/navbar-menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'bookWorm';
}
