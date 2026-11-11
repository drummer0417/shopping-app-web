import { Component, DestroyRef, effect, inject, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../data/data.service';
import { ProductItem } from '../product-item/product-item';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { Article } from '../../data/model';
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
export class Producten implements OnInit {
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allArticles = this.dataService.allArticless;
  searchValue = signal('');

  filteredArticles = computed(() => {
    const search = this.searchValue().trim().toUpperCase();
    const articles = this.allArticles();
    if (!search) {
      return articles;
    }
    return articles.filter(
      (article) =>
        article.description?.toUpperCase().includes(search) ||
        article.brand?.toUpperCase().includes(search),
    );
  });

  form = new FormGroup({
    searchValue: new FormControl('', {}),
  });

  article = { price: 0 };

  ngOnInit(): void {
    const subscription = this.form.controls.searchValue.valueChanges.subscribe((value) => {
      this.searchValue.set(value || '');
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  resetSearchValue() {
    this.form.controls.searchValue.reset();
  }

  addProduct(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxWidth = '2000px';
    this.dialog;
    dialogConfig.minWidth = '90vw';
    dialogConfig.data = { article: this.article, title: 'Add' };
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(EditProductDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result: { action: string; article: Article }) => {
      console.log(result.action);
      console.log(result.article);

      if (result.action === 'save') {
        this.dataService.addArticle(result.article);
        this.snackBar.open(result.article.description + ' toegevoegd', '', { duration: 5000 });
      }
    });
  }
}
