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
  orderedArticles = computed(() => this.dataService.getOrderedArticles());
  confirmationDialog = inject(MatDialog);
  pickedArticles = computed(() => {
    var number = 0;
    this.orderedArticles().forEach((article: Article) => {
      if (article.picked) {
        number++;
      }
    });
    return number;
  });

  resetOrderedAndPicked() {
    if (this.pickedArticles().valueOf() > 0) {
      this.openConfirmationDialog();
    }
  }

  openConfirmationDialog(): void {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '350px',
      data: {
        title: 'Bevestig',
        message: 'Producten die al in het karretje liggen verwijderen?',
      },
    });

    dialogRef.afterClosed().subscribe((bevestigd: boolean) => {
      if (bevestigd) {
        this.dataService.resetOrderedAndPickedArticles();
      }
    });
  }
}
