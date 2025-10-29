import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CardCollectionComponent } from '../../components/card-collection/card-collection.component';
import { Collection } from '../../models/api.models';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-bookcase',
  imports: [CardCollectionComponent],
  templateUrl: './bookcase.component.html',
  styleUrl: './bookcase.component.css'
})

export class BookcaseComponent implements OnInit {
  collections$!: Observable<Collection[]>;

  constructor(private collectionService: CollectionService) {}

  ngOnInit(): void {
    this.collections$ = this.collectionService.getMyCollections();
  }
}
