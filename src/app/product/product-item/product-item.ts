import { Component, effect, inject, Input } from '@angular/core';
import { Article } from '../../data/model';
import { DataService } from '../../data/data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { EditProductDialog } from '../edit-product-dialog/edit-product-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-product-item',
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './product-item.html',
  styleUrl: './product-item.scss',
})
export class ProductItem {
  @Input() article!: Article;
  private dataService = inject(DataService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  onRowClicked() {
    console.log('this.article');
    console.log(this.article);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxWidth = '2000px';
    dialogConfig.width = '90vw';
    dialogConfig.data = { article: this.article, title: 'Update' };
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(EditProductDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result: { action: string; article: Article }) => {
      if (result.action === 'save') {
        this.dataService.updateArticle(result.article);
        this.snackBar.open('Product gewijzigd', '', { duration: 5000 });
      } else if (result.action === 'delete') {
        this.dataService.deleteArticle(result.article.id);
        this.snackBar.open(result.article.description + ' verwijderd', '', { duration: 5000 });
      }
    });
  }
}
