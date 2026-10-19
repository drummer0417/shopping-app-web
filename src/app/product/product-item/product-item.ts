import { Component, effect, inject, Input } from '@angular/core';
import { Product } from '../../data/model';
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
  @Input() product!: Product;
  private dataService = inject(DataService);
  private readonly dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  constructor() {
    effect(() => console.log('value changed'));
  }

  onRowClicked() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxHeight = '2000px';
    dialogConfig.maxWidth = '600px';
    dialogConfig.data = { product: this.product, title: 'Update' };
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(EditProductDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result: { action: string; product: Product }) => {
      if (result.action === 'save') {
        console.log('id: ' + result.product.id);
        this.dataService.updateArticle(result.product);
        this.snackBar.open('Product gewijzigd', '', { duration: 5000 });
      } else if (result.action === 'delete') {
        console.log('result');
        this.dataService.deleteProcduct(result.product.id);
        this.snackBar.open(result.product.omschrijving + ' verwijderd', '', { duration: 5000 });
      }
    });
  }
}
