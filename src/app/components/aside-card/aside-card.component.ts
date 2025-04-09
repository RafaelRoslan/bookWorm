import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aside-card',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './aside-card.component.html',
  styleUrl: './aside-card.component.css'
})
export class AsideCardComponent {
  @Input() imagemUrl!: string;
  @Input() titulo!: string;
  @Input() autor!: string;
  @Input() tempo!: string;
  @Input() tags!: string[];
  @Input() id!: number;

}
