import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataService } from '../../data/data.service';
import { MatSelectModule } from '@angular/material/select';
import { Product } from '../../data/model';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit-product-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckbox,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTooltip,
  ],
  templateUrl: './edit-product-dialog.html',
  styleUrl: './edit-product-dialog.scss',
})
export class EditProductDialog {
  dataService = inject(DataService);
  categorien = this.dataService.getCategorienSorted();
  winkels = this.dataService.getWinkelsSorted();
  dialogTitle: string = 'Aanpassen product';
  form: FormGroup;
  title?: string;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product; title: string },
    public dialogRef: MatDialogRef<EditProductDialog>,
  ) {
    this.title = this.data.title === 'Add' ? 'Toevoegen procuct' : 'Wijzigen product';
    this.form = this.fb.group({
      id: [this.data.product.id],
      omschrijving: [this.data.product.omschrijving],
      merk: [this.data.product.merk],
      prijs: [this.data.product.prijs],
      winkel: [this.data.product.winkel],
      eenheid: [this.data.product.eenheid],
      aanbieding: [this.data.product.aanbieding],
      categorie: [this.data.product.categorie],
      opmerking: [this.data.product.opmerking],
      aantalBesteld: [this.data.product.aantalBesteld],
      picked: [this.data.product.picked],
    });
  }

  onSave() {
    console.log('dialog.onSave()');
    this.dialogRef.close({ action: 'save', product: this.form.value });
  }
  
  onDelete() {
    console.log('dialog.onDelete');
    this.dialogRef.close({ action: 'delete', product: this.form.value });
  }

  onCancel() {
    console.log('dialog.onCancdel()');
    this.dialogRef.close({ action: 'cancel' });
  }

  compareWinkels(winkel1: any, winkel2: any): boolean {
    return winkel1 && winkel2 ? winkel1.id === winkel2.id : winkel1 === winkel2;
  }

  compareCategorien(categorie1: any, categorie2: any): boolean {
    return categorie1 && categorie2
      ? categorie1.omschrijving === categorie2.omschrijving
      : categorie1 === categorie2;
  }
}
