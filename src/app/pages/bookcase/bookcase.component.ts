import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { CardCollectionComponent } from "../../components/card-collection/card-collection.component";

@Component({
  selector: 'app-bookcase',
  imports: [NgFor, CardCollectionComponent],
  templateUrl: './bookcase.component.html',
  styleUrl: './bookcase.component.css'
})
export class BookcaseComponent {
  collections = [
    { id: 1, name: 'Nome Coleção', image: '' },
    { id: 2, name: 'Nome Coleção', image: '' },
    { id: 3, name: 'Nome Coleção', image: '' },
    { id: 4, name: 'Nome Coleção', image: '' }
  ];
}
