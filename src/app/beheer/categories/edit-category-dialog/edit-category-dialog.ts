import { Component, Inject, inject } from '@angular/core';
import { ConfirmationDialog } from '../../../confirmation-dialog/confirmation-dialog';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { DataService } from '../../../data/data.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../../data/model';
import { MatError, MatInputModule, MatLabel } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit-category-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatTooltip,
  ],
  templateUrl: './edit-category-dialog.html',
  styleUrl: './edit-category-dialog.scss',
})
export class EditCategoryDialog {
  confirmationDialog = inject(MatDialog);
  dataService = inject(DataService);
  form: FormGroup;
  errorMessage: string | undefined = undefined;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { category: Category; title: string },
  ) {
    this.form = this.fb.group({
      id: [this.data.category.id],
      description: [this.data.category.description],
      location: [this.data.category.location],
    });
  }

  onSave() {
    const category: Category = this.form.value;
    if (this.data.title.startsWith('Toevoegen') && this.dataService.categoryExists(category)) {
      this.errorMessage =
        'Categorie met deze naam en/of locatie bestaat al. Kies andere naam of locatie.';
    } else {
      this.dialogRef.close({ action: 'save', category: this.form.value });
    }
  }

  onCancel() {
    this.dialogRef.close({ action: 'cancel' });
  }

  onDelete() {
    const category: Category = this.form.value;
    if (this.dataService.isCategoryUsed(category)) {
      this.errorMessage = 'Categorie wordt in een of meer producten gebruikt.';
    } else {
      this.confirm();
    }
  }

  confirm(): void {
    const dialogRef = this.confirmationDialog.open(ConfirmationDialog, {
      width: '350px',
      data: {
        title: 'Bevestig',
        message: 'Wil je "' + this.data.category.description + '" verwijderen?',
      },
    });

    dialogRef.afterClosed().subscribe((bevestigd: boolean) => {
      if (bevestigd) {
        this.dialogRef.close({ action: 'delete', category: this.form.value });
      } else {
        this.dialogRef.close({ action: 'cancel' });
      }
    });
  }
}
