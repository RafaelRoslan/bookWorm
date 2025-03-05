import { Component } from '@angular/core';
import { ForumItemComponent } from "../../components/forum-item/forum-item.component";

@Component({
  selector: 'app-forum',
  imports: [ForumItemComponent],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})
export class ForumComponent {

}
