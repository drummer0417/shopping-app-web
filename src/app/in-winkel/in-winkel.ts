import { Component, computed, inject } from '@angular/core';
import { FirestoreService } from '../data/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { InWinkeltItem } from '../in-winkel-item/in-winkel-item';

@Component({
  imports: [InWinkeltItem],
  selector: 'app-in-winkel',
  styleUrl: './in-winkel.css',
  templateUrl: './in-winkel.html',
})
export class InWinkel {
  firestoreService = inject(FirestoreService);
  besteldeProducten = computed(() => this.firestoreService.getBesteldeProcucten());

  ngOnInit(): void {
    if (!this.firestoreService.alleProducten() || this.firestoreService.alleProducten().length === 0
    ) {
      this.firestoreService.initData();
    }
  }
}
