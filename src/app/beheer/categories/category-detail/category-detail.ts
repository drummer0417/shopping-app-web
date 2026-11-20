import { Component, inject, Input } from '@angular/core';
import { Category } from '../../../data/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { EditCategoryDialog } from '../edit-category-dialog/edit-category-dialog';
import { DataService } from '../../../data/data.service';

@Component({
  selector: 'app-category-detail',
  imports: [],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.scss',
})
export class CategorieDetail {
  @Input() category?: Category;
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private dataService = inject(DataService);

  updateCategory() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.maxWidth = '800px';
    dialogConfig.width = '90vw';
    dialogConfig.data = {
      category: this.category,
      title: 'Wijzigen category',
    };
    dialogConfig.autoFocus = true;
    const dialogRef = this.dialog.open(EditCategoryDialog, dialogConfig);
    dialogRef.afterClosed().subscribe((result: { action: string; category: Category }) => {
      if (result.action === 'save') {
        this.dataService.updateCategory(result.category);
        this.snackBar.open('Categorie "' + result.category.description + '" gewijzigd', '', {
          duration: 5000,
        });
      } else if (result.action === 'delete') {
        this.dataService.deleteCategory(result.category.id);
        this.snackBar.open('Categorie "' + result.category.description + "'" + ' verwijderd', '', {
          duration: 5000,
        });
      }
    });
  }
}
