import { Component, inject, Input, input, signal } from '@angular/core';
import { Article } from '../data/model';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FirestoreService } from '../data/data.service';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-in-winkel-item',
  styleUrl: './in-winkel-item.css',
  templateUrl: './in-winkel-item.html',
})
export class InWinkeltItem {
  @Input() article!: Article;
  private firestoreService = inject(FirestoreService);

  onClick() {
    console.log(this.article.id);
    this.firestoreService.updatePickedItem(this.article.id);
  }
}
