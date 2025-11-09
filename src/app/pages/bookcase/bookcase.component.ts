import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { CardCollectionComponent } from '../../components/card-collection/card-collection.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { NameDialogComponent } from '../../components/name-dialog/name-dialog.component';
import { Collection } from '../../models/api.models';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'app-bookcase',
  standalone: true,
  imports: [CommonModule, CardCollectionComponent, NameDialogComponent, ConfirmDialogComponent],
  templateUrl: './bookcase.component.html',
  styleUrl: './bookcase.component.css'
})
export class BookcaseComponent implements OnInit {
  collections$!: Observable<Collection[]>;

  // criar
  createOpen = false;

  // renomear
  renameOpen = false;
  renameTarget: { id: string; name: string } | null = null;

  // excluir
  deleteOpen = false;
  deleteId: string | null = null;

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.collections$ = this.collectionService.getMyCollections().pipe(tap(() => {}));
  }

  // ===== criar =====
  openCreate(){ this.createOpen = true; document.body.style.overflow = 'hidden'; }
  closeCreate(){ this.createOpen = false; document.body.style.overflow = ''; }
  doCreate(name: string){
    this.collectionService.createCollection({ name }).subscribe({
      next: () => { this.closeCreate(); this.load(); }
    });
  }

  // ===== renomear =====
  editCollection(e: { id: string; name: string }) {
    this.renameTarget = e;
    this.renameOpen = true;
    document.body.style.overflow = 'hidden';
  }
  closeRename(){ this.renameOpen = false; this.renameTarget = null; document.body.style.overflow = ''; }
  doRename(newName: string){
    if (!this.renameTarget) return;
    this.collectionService.updateCollection(this.renameTarget.id, { name: newName }).subscribe({
      next: () => { this.closeRename(); this.load(); }
    });
  }

  // ===== excluir =====
  deleteCollection(id: string) {
    this.deleteId = id;
    this.deleteOpen = true;
    document.body.style.overflow = 'hidden';
  }
  closeDelete(){ this.deleteOpen = false; this.deleteId = null; document.body.style.overflow = ''; }
  doDelete(){
    if (!this.deleteId) return;
    this.collectionService.deleteCollection(this.deleteId).subscribe({
      next: () => { this.closeDelete(); this.load(); }
    });
  }

  openCollection(id: string) {
    this.router.navigate(['/bookcase', id]);
  }
}
