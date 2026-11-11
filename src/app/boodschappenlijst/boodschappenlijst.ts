import { Component, inject, OnInit, computed, DestroyRef, signal } from '@angular/core';
import { DataService } from '../data/data.service';
import { BoodschappenlijstItem } from './boodschappenlijst-item/boodschappenlijst-item';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Article } from '../data/model';

@Component({
  imports: [
    ReactiveFormsModule,
    BoodschappenlijstItem,
    MatIconModule,
    MatInputModule,
    MatCardModule,
  ],
  selector: 'app-boodschappen',
  styleUrl: './boodschappenlijst.scss',
  templateUrl: './boodschappenlijst.html',
})
export class BoodschappenLijst implements OnInit {
  destroyRef = inject(DestroyRef);
  dataService = inject(DataService);
  AllArticles: Article[] = this.dataService.getAllArticlesWithNumberOrdered();

  searchValue = signal('');
  filteredBoodschappenlijst = computed(() => {
    const search = this.searchValue().trim().toUpperCase();
    const articles = this.AllArticles;
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
