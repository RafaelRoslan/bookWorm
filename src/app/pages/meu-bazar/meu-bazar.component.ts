import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe  } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingService, Listing } from '../../services/listing.service';

@Component({
  standalone: true,
  selector: 'app-meu-bazar',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './meu-bazar.component.html',
  styleUrl: './meu-bazar.component.css'
})

export class MeuBazarComponent implements OnInit {
  items: Listing[] = [];
  loading = false;
  error = '';

  // edição inline simples
  editId: string | null = null;
  form = { price: 0, condition: 'bom' as Listing['condition'], stock: 1, shipping: 'combinado' as Listing['shipping'] };

  constructor(private listing: ListingService) {}
  ngOnInit(){ this.load(); }

  load(){
    this.loading = true; this.error = '';
    this.listing.getMyListings().subscribe({
      next: res => { this.items = res.items; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Falha ao carregar'; this.loading = false; }
    });
  }

  startEdit(it: Listing){
    this.editId = it._id;
    this.form = { price: it.price, condition: it.condition, stock: it.stock, shipping: it.shipping };
  }

  cancelEdit(){ this.editId = null; }

  saveEdit(it: Listing){
    this.listing.updateListing(it._id, this.form).subscribe({
      next: () => { this.editId = null; this.load(); },
      error: e => alert(e?.error?.message || 'Falha ao atualizar anúncio')
    });
  }

  remove(it: Listing) {
    if (!confirm('Remover este anúncio?')) return;
    this.listing.deleteListing(it._id).subscribe({
      next: () => this.load(),
      error: e => alert(e?.error?.message || 'Falha ao remover anúncio')
    });
  }
}
