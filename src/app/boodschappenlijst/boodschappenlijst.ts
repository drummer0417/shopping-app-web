import {
  Component,
  inject,
  OnInit,
  computed,
  DestroyRef,
  signal,
} from '@angular/core';
import { DataService } from '../data/data.service';
import { BoodschappenlijstItem } from './boodschappenlijst-item/boodschappenlijst-item';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [ReactiveFormsModule, BoodschappenlijstItem, MatIconModule, MatInputModule, MatCardModule],
  selector: 'app-boodschappen',
  styleUrl: './boodschappenlijst.scss',
  templateUrl: './boodschappenlijst.html',
})
export class BoodschappenLijst implements OnInit {
  destroyRef = inject(DestroyRef);
  dataService = inject(DataService);
  alleProducten = this.dataService.alleProducten;
  // boodschappenlijst = computed(() => this.dataService.alleProducten());
    searchValue = signal('');
  filteredBoodschappenlijst = computed(() => {
    const search = this.searchValue().trim().toUpperCase();
    const products = this.alleProducten();
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

  ngOnInit(): void {
    const subscription = this.form.controls.searchValue.valueChanges.subscribe((value) => {
      this.searchValue.set(value || '');
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
  
  resetSearchValue() {
    this.form.controls.searchValue.reset();
  }

}
