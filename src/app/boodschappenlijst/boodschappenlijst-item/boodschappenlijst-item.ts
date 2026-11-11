import { Component, inject, Input } from '@angular/core';
import { Article, OrderedArticle } from '../../data/model';
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
  @Input() article!: Article;
  private dataService = inject(DataService);

  onResetProduct() {
    this.article.ordered = 0;
    this.dataService.updateOrderedArticle(this.article);
  }

  onAddArticle() {
    console.log('onAddArticle clicked');
    ++this.article.ordered;
    this.article.picked = false;
    this.dataService.updateOrderedArticle(this.article);
  }
}
