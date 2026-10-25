import { Component, inject, Input, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../data/model';
import { DataService } from '../../data/data.service';

@Component({
  imports: [CurrencyPipe, MatButtonModule, MatIconModule],
  selector: 'app-in-winkel-item',
  styleUrl: './in-winkel-item.scss',
  templateUrl: './in-winkel-item.html',
})
export class InWinkeltItem {
  @Input() product!: Product;
  private dataService = inject(DataService);

  onClick() {
    console.log(this.product.id);
    if (this.product.id !==  null) {
      console.log(this.product);
      this.product.picked = !this.product.picked;
      this.dataService.updatePickedProduct(this.product);
    }
  }
}
