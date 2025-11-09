import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, Component } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes /*, withDebugTracing() */),
    provideHttpClient(),         // 👈 HTTP habilitado globalmente
    provideClientHydration(),    // opcional, se estiver usando hydration
  ],
};
