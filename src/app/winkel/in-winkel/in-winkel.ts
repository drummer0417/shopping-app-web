import { Component, computed, inject } from '@angular/core';
import { DataService } from '../../data/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { InWinkeltItem } from '../in-winkel-item/in-winkel-item';
import { Product } from '../../data/model';
import { CdkColumnDef } from '@angular/cdk/table';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';

@Component({
  imports: [InWinkeltItem, MatIconModule, MatAnchor],
  selector: 'app-in-winkel',
  styleUrl: './in-winkel.scss',
  templateUrl: './in-winkel.html',
})
export class InWinkel {
  dataService = inject(DataService);
  besteldeProducten = computed(() => this.dataService.getBesteldeProducten());
  pickedProducten = computed(() => {
    var number = 0;
    this.besteldeProducten().forEach((procuct: Product) => {
      if (procuct.picked) {
        number++;
      }
    });
    return number;
  });

  ngOnInit(): void {
    if (!this.dataService.alleProducten() || this.dataService.alleProducten().length === 0) {
      this.dataService.initData();
    }
  }

  resetOrderedAndPicked() {
    console.log('resetOrderedAndPicked');
    
    this.dataService.resetOrderedAndPickedProduct();
  }
}
