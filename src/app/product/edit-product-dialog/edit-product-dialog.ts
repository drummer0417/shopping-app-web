import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataService } from '../../data/data.service';
import { MatSelectModule } from '@angular/material/select';
import { Article } from '../../data/model';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { ConfirmationDialog } from '../../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-edit-product-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckbox,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTooltip,
  ],
  standalone: true,
  templateUrl: './edit-product-dialog.html',
  styleUrl: './edit-product-dialog.scss',
})
export class EditProductDialog {
  confirmationDialog = inject(MatDialog);
  dataService = inject(DataService);
  categories = this.dataService.getCategoriesSorted();
  shops = this.dataService.getShopsSorted();
  dialogTitle: string = 'Aanpassen product';
  form: FormGroup;
  title?: string;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { article: Article; title: string },
    public dialogRef: MatDialogRef<EditProductDialog>,
  ) {
    this.title = this.data.title === 'Add' ? 'Toevoegen procuct' : 'Wijzigen product';
    this.form = this.fb.group({
      id: [this.data.article.id],
      description: [this.data.article.description],
      brand: [this.data.article.brand],
      price: [this.data.article.price],
      shop: [this.data.article.shop],
      uom: [this.data.article.uom],
      specialOffer: [this.data.article.specialOffer],
      category: [this.data.article.category],
      note: [this.data.article.note],
      ordered: [this.data.article.ordered],
      picked: [this.data.article.picked],
    });
  }

  onSave() {
    console.log(this.form.value);

    this.dialogRef.close({ action: 'save', article: this.form.value });
  }

  onCancel() {
    this.dialogRef.close({ action: 'cancel' });
  }

  onDelete() {
    this.openConfirmDialog();
  }

  openConfirmDialog(): void {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '350px',
      data: {
        title: 'Bevestig',
        message: 'Wil je "' + this.data.article.description + '" verwijderen?',
      },
    });

    dialogRef.afterClosed().subscribe((bevestigd: boolean) => {
      if (bevestigd) {
        this.dialogRef.close({ action: 'delete', article: this.form.value });
      } else {
        this.dialogRef.close({ action: 'cancel' });
      }
    });
  }

  compareShops(shop1: any, shop2: any): boolean {
    return shop1 && shop2 ? shop1.id === shop2.id : shop1 === shop2;
  }

  compareCategorien(category1: any, category2: any): boolean {
    return category1 && category2 ? category1.id === category2.id : category1 === category2;
  }
}
