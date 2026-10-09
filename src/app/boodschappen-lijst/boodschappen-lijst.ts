import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FirestoreService } from '../data/data.service';
import { Article } from '../data/model';

@Component({
  imports: [],
  selector: 'app-boodschappen',
  styleUrl: './boodschappen-lijst.css',
  templateUrl: './boodschappen-lijst.html',
})
export class BoodschappenLijst implements OnInit {
  firestoreService = inject(FirestoreService);
  // shoppingList: Article[] = [];
  shoppingList = computed(() => this.firestoreService.alleProducten());

  ngOnInit(): void {
    // this.shoppingList = this.firestoreService.matchingArticles();
  }
  // allAricles = this.firestoreService.allArticals;
}
