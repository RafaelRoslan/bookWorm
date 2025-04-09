import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-comment',
  imports: [NgIf],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() avatarUrl!: string;
  @Input() author!: string;
  @Input() date!: string;
  @Input() content!: string;
  @Input() quote?: string;
}
