import { Component, computed, effect, inject, signal } from '@angular/core';
import { DataService } from '../../data/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { InWinkeltItem } from '../in-winkel-item/in-winkel-item';
import { Product } from '../../data/model';
import { CdkColumnDef } from '@angular/cdk/table';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';

@Component({
  imports: [InWinkeltItem, MatIconModule],
  selector: 'app-in-winkel',
  styleUrl: './in-winkel.scss',
  templateUrl: './in-winkel.html',
})
export class InWinkel {
  dataService = inject(DataService);
  besteldeProducten = signal<Product[]>([]);
  pickedProducten = computed(() => {
    var number = 0;
    this.besteldeProducten().forEach((procuct: Product) => {
      if (procuct.picked) {
        number++;
      }
    });
    return number;
  });

  constructor () {
    effect(() => {
      this.besteldeProducten.set(this.dataService.getOrderedArticles());
    });
  }

  ngOnInit(): void {
    // if (!this.dataService.alleProducten() || this.dataService.alleProducten().length === 0) {
    //   this.dataService.initData();
    // }
    // console.log('this.dataService.getBesteldeProducten2()...');
    // console.log(this.dataService.getBesteldeProducten());
    
  }

  resetOrderedAndPicked() {
    console.log('resetOrderedAndPicked');
    
    this.dataService.resetOrderedAndPickedProduct();
  }
}
