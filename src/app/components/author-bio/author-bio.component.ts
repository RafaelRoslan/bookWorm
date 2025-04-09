import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-author-bio',
  imports: [NgIf],
  templateUrl: './author-bio.component.html',
  styleUrl: './author-bio.component.css'
})
export class AuthorBioComponent {
  @Input() nome!: string;
  @Input() bio!: string;
  @Input() fotoUrl?: string;
}
