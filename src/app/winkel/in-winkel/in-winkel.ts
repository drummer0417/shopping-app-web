import { Component, computed, effect, inject, signal } from '@angular/core';
import { DataService } from '../../data/data.service';
import { InWinkeltItem } from '../in-winkel-item/in-winkel-item';
import { Article } from '../../data/model';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';

@Component({
  imports: [InWinkeltItem, MatIconModule],
  selector: 'app-in-winkel',
  styleUrl: './in-winkel.scss',
  templateUrl: './in-winkel.html',
})
export class InWinkel {
  dataService = inject(DataService);
  besteldeProducten = signal<Article[]>([]);
  confirmationDialog = inject(MatDialog);
  pickedProducten = computed(() => {
    var number = 0;
    this.besteldeProducten().forEach((article: Article) => {
      if (article.picked) {
        number++;
      }
    });
    return number;
  });

  constructor() {
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
    if (this.pickedProducten().valueOf() > 0) {
      this.openConfirmDialog();
    }
  }

  openConfirmDialog(): void {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '350px',
      data: {
        title: 'Bevestig',
        message: 'Alle producten die al in het karretje liggen wil verwijderen?',
      },
    });

    dialogRef.afterClosed().subscribe((bevestigd: boolean) => {
      if (bevestigd) {
        this.dataService.resetOrderedAndPickedArticles();
      }
    });
  }
}
