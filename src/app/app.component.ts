import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./components/footer/footer.component";
import { NavbarMenuComponent } from "./components/navbar-menu/navbar-menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarMenuComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'bookWorm';
}
