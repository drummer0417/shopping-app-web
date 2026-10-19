import { Component, inject, Input } from '@angular/core';
import { Product } from '../../data/model';
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

  onReset() {
    console.log('onReset clicked');
    this.dataService.updateOrderdProduct(this.product.id, this.product.aantalBesteld =0);
  }

  onSelect() {
    console.log('onSelect clicked');
    this.dataService.updateOrderdProduct(this.product.id, ++this.product.aantalBesteld);
  }
}
