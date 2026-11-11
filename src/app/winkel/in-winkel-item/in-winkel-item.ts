import { Component, inject, Input, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Article } from '../../data/model';
import { DataService } from '../../data/data.service';

@Component({
  imports: [CurrencyPipe, MatButtonModule, MatIconModule],
  selector: 'app-in-winkel-item',
  styleUrl: './in-winkel-item.scss',
  templateUrl: './in-winkel-item.html',
})
export class InWinkeltItem {
  @Input() article!: Article;
  private dataService = inject(DataService);

  onSwapPicked() {
    console.log(this.article.id);
    if (this.article.id !== null) {
      this.article.picked = !this.article.picked;
      this.dataService.updatePickedOrderedArticle(this.article);
    }
  }
}
