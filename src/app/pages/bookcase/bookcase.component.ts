import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { CardCollectionComponent } from '../../components/card-collection/card-collection.component';
import { Collection } from '../../models/api.models';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-bookcase',
  standalone: true,
  imports: [CommonModule, CardCollectionComponent],
  templateUrl: './bookcase.component.html',
  styleUrl: './bookcase.component.css'
})
export class BookcaseComponent implements OnInit {
  collections$!: Observable<Collection[]>;
  private reloadToggle = false;

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.collections$ = this.collectionService.getMyCollections().pipe(
      tap(() => {})
    );
  }

  // ===== CRUD =====
  createCollection() {
    const name = prompt('Nome da nova coleção:');
    if (!name || !name.trim()) return;
    this.collectionService.createCollection({ name: name.trim() })
      .subscribe({ next: () => this.load() });
  }

  editCollection(e: { id: string; name: string }) {
    const newName = prompt('Novo nome da coleção:', e.name);
    if (!newName || !newName.trim()) return;
    this.collectionService.updateCollection(e.id, { name: newName.trim() })
      .subscribe({ next: () => this.load() });
  }

  deleteCollection(id: string) {
    if (!confirm('Excluir esta coleção?')) return;
    this.collectionService.deleteCollection(id)
      .subscribe({ next: () => this.load() });
  }

  openCollection(id: string) {
    this.router.navigate(['/bookcase', id]);
  }
}
