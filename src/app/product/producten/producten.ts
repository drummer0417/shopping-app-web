import { Component, DestroyRef, effect, inject, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../data/data.service';
import { ProductItem } from '../product-item/product-item';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../../data/model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { EditProductDialog } from '../edit-product-dialog/edit-product-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [
    ProductItem,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
  ],
  selector: 'app-producten',
  styleUrl: './producten.scss',
  templateUrl: './producten.html',
})

export class Producten  implements OnInit {
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allProducts = this.dataService.alleProducten; 

  searchValue = signal('');

  filteredProducts = computed(() => {
    const search = this.searchValue().trim().toUpperCase();
    const products = this.allProducts();
    if (!search) {
      return products;
    }
    return products.filter((product) => 
      product.omschrijving?.toUpperCase().includes(search) ||
      product.merk?.toUpperCase().includes(search)
    );
  });

  form = new FormGroup({
    searchValue: new FormControl('', {}),
  });

  product = {};

  ngOnInit(): void {
    const subscription = this.form.controls.searchValue.valueChanges.subscribe((value) => {
      this.searchValue.set(value || '');
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  addProduct(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxHeight = '2000px';
    dialogConfig.maxWidth = '600px';
    dialogConfig.data = { product: this.product, title: 'Add' };
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(EditProductDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result: { action: string; product: Product }) => {
      if (result.action === 'save') {
        this.dataService.addProduct(result.product);
        this.snackBar.open(result.product.omschrijving + ' toegevoegd', '', { duration: 5000 });
      } 
    });
  }
}