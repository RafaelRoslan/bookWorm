import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingService, Listing } from '../../services/listing.service';

@Component({
  standalone: true,
  selector: 'app-bazar',
  imports: [CommonModule, FormsModule],
  templateUrl: './bazar.component.html',
  styleUrls: ['./bazar.component.css']
})
export class BazarComponent implements OnInit {
  items: Listing[] = [];
  total = 0; page = 1; pageSize = 20; pages = 1;
  q = ''; sort = 'recent';
  minPrice?: number; maxPrice?: number;
  loading = false; error = '';

  constructor(private listing: ListingService) {}
  ngOnInit(){ this.load(1); }

  load(p = this.page) {
    this.loading = true;
    this.error = '';
    this.page = Math.max(1, p);
    this.listing.getListings({ q: this.q, sort: this.sort, page: this.page, pageSize: this.pageSize, minPrice: this.minPrice, maxPrice: this.maxPrice })
      .subscribe({
        next: res => {
          this.items = res.items;
          this.total = res.total;
          this.pages = Math.max(1, Math.ceil(res.total / this.pageSize));
          this.loading = false;
        },
        error: e => {
          this.error = e?.error?.message || 'Falha ao carregar bazar';
          this.loading = false;
        }
      });
  }

  clearFilters(){
    this.q = ''; this.sort = 'recent'; this.minPrice = undefined; this.maxPrice = undefined;
    this.load(1);
  }
}
