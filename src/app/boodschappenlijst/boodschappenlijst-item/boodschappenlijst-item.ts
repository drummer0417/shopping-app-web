import { Component, inject, Input } from '@angular/core';
import { Product, OrderedArticle } from '../../data/model';
import { DataService } from '../../data/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-boodschappenlijst-item',
  imports: [CurrencyPipe, DatePipe, MatIconModule],
  templateUrl: './boodschappenlijst-item.html',
  styleUrl: './boodschappenlijst-item.scss',
})
export class BoodschappenlijstItem {
  @Input() product!: Product;
  private dataService = inject(DataService);

  onResetProduct() {
    this.product.aantalBesteld = 0;
    this.dataService.updateOrderedArticle(this.product);
  }

  onAddProduct() {
    console.log('onAddProduct clicked');
    ++this.product.aantalBesteld;
    this.product.picked = false;
    this.dataService.updateOrderedArticle(this.product);
  }
  
}
