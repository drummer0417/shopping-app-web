import {
  Component,
  inject,
  OnInit,
  computed,
  DestroyRef,
} from '@angular/core';
import { DataService } from '../data/data.service';
import { Product } from '../data/model';
import { BoodschappenlijstItem } from './boodschappenlijst-item/boodschappenlijst-item';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [ReactiveFormsModule, BoodschappenlijstItem, MatInputModule],
  selector: 'app-boodschappen',
  styleUrl: './boodschappenlijst.scss',
  templateUrl: './boodschappenlijst.html',
})
export class BoodschappenLijst implements OnInit {
  destroyRef = inject(DestroyRef);
  dataService = inject(DataService);
  boodschappenlijst = computed(() => this.dataService.getProductenSorted());
  filteredBoodschappenlijst: Product[] = [];

  form = new FormGroup({
    searchValue: new FormControl('', {}),
  });

  ngOnInit(): void {
    this.filteredBoodschappenlijst = this.boodschappenlijst();

    const subscription = this.form.controls.searchValue.valueChanges.subscribe((searchValue) => {
      console.log('Gebruiker typte:', searchValue);
      this.filterBoodschappenlijst(searchValue || '');
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  private filterBoodschappenlijst(searchValue: string) {
    searchValue = searchValue.toUpperCase();
    if (searchValue.length === 0) {
      this.filteredBoodschappenlijst = this.boodschappenlijst();
    }
    let filteredList: Product[] = [];
    if (searchValue) {
      this.boodschappenlijst().forEach((product: Product) => {
        if (searchValue.length <= product.omschrijving.length) {
          if (product.omschrijving?.toUpperCase().includes(searchValue)
          || product.merk?.toUpperCase().includes(searchValue)
          ) {
            filteredList.push(product);
          }
        }
      });
      this.filteredBoodschappenlijst = filteredList;
    }
  }
}
