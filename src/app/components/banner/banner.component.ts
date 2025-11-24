import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [NgIf],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {
  @Input() imageUrl?: string;

  readonly defaultBanner = 'assets/images/banner_home.jpg';

  get bannerSrc(): string {
    return this.imageUrl || this.defaultBanner;
  }
}
