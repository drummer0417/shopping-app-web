import { Component, computed, inject } from '@angular/core';
import { DataService } from '../../../data/data.service';
import { Category } from '../../../data/model';
import { MatIconModule } from '@angular/material/icon';
import { CategorieDetail } from '../category-detail/category-detail';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditCategoryDialog } from '../edit-category-dialog/edit-category-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-categories',
  imports: [CategorieDetail, MatIconModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  dataservice = inject(DataService);
  allCategories = computed(() => this.dataservice.getCategoriesSortedByLocation());
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  addCategory() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxWidth = '800px';
    dialogConfig.width = '90vw';
    dialogConfig.data = {
      category: {},
      title: 'Toevoegen category',
    };
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(EditCategoryDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result: { action: string; category: Category }) => {
      if (result.action === 'save') {
        this.dataservice.addCategory(result.category);
        this.snackBar.open('Categorie "' + result.category.description + '" toegevoegd', '', {
          duration: 5000,
        });
      }
    });
  }
}
