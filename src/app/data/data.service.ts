import { inject, Injectable, Signal, signal } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  sortedChanges,
} from '@angular/fire/firestore';
import { User } from '../auth/user.model';
import { Auth, authState } from '@angular/fire/auth';
import { Article, Categorie, Category, Product, Shop, Winkel } from './model';
import { DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { O } from '@angular/cdk/keycodes';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private producten = signal<Product[]>([]);
  private categorien = signal<Categorie[]>([]);
  // private orderedArticles = signal<Category[]>([]);
  private winkels = signal<Winkel[]>([]);
  private queryUser: string = '';

  //alleProducten = this.producten.asReadonly();
  alleProducten = this.producten.asReadonly();
  alleCategorien = this.categorien.asReadonly();
  alleWinkels = this.winkels.asReadonly();
  articlesFetched = signal(false);
  categoriesFetched = signal(false);
  shopsFetched = signal(false);
  allDataFetched = signal<boolean>(false);

  // Een BehaviorSubject houdt de data vast voor de hele app
  private myDataSubject = new BehaviorSubject<any>(null);
  myData$ = this.myDataSubject.asObservable();

  constructor() {
    // Luister globaal naar de inlogstatus
    authState(this.auth)
      .pipe(
        switchMap((user) => {
          if (user) {
            // Gebruiker is ingelogd (of hersteld na F5)! Haal nu de data op.
            return this.initData();
          } else {
            // Niet ingelogd, reset de data
            return of(null);
          }
        }),
      )
      .subscribe((data) => {
        // this.myDataSubject.next(data);
      });
  }

  initData() {
    const productsRef = collection(this.firestore, 'Users');
    collectionData(productsRef, { idField: 'id' }).subscribe((users: any) => {
      this.getQueryUser(users);
    });
    return of(null);
  }

  getQueryUser(users: User[]) {
    users.forEach((user: User) => {
      if (user.firebaseUID === this.auth.currentUser?.uid) {
        this.queryUser = user.id;
        this.fetchProducten();
        this.fetchCategorien();
        this.fetchWinkels();
      }
    });
  }

  async fetchProducten(): Promise<void> {
    const articleRef = collection(this.firestore, 'Users', this.queryUser, 'Articles');

    try {
      // getDocs haalt de data eenmalig op
      const querySnapshot = await getDocs(articleRef);

      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const article = { ...(doc.data() as Article), id: doc.id };
        products.push(this.mapArticleToProduct(article));
      });
      const sortedProducts = this.sortProducts(products);

      this.producten.set(this.sortProducts(products));
      this.articlesFetched.set(true);
      this.allDataFetched.set(
        this.alleCategorien() && this.categoriesFetched() && this.shopsFetched(),
      );
    } catch (error) {
      console.error('Fout bij ophalen producten:', error);
    }
  }

  fetchCategorien(): void {
    const categoryRef = collection(this.firestore, 'Users', this.queryUser, 'Categories');
    // collectionData(categoryRef, { idField: 'id' }).subscribe((categories: any) => {
    (collectionData(categoryRef, { idField: 'id' }) as Observable<Category[]>).subscribe(
      (categories) => {
        const categorien: Categorie[] = [];
        categories.forEach((category: Category) => {
          categorien.push(this.mapCategoryToCategorie(category));
        });
        this.categorien.set(categorien);
        this.categoriesFetched.set(true);
        this.allDataFetched.set(
          this.alleCategorien() && this.categoriesFetched() && this.shopsFetched(),
        );
      },
    );
  }

  fetchWinkels(): void {
    // const userId = queryUser ? queryUser : 'unknown'
    const shopRef = collection(this.firestore, 'Users', this.queryUser, 'Shops');
    // collectionData(shopRef, { idField: 'id' }).subscribe((shops: any) => {
    (collectionData(shopRef, { idField: 'id' }) as Observable<Shop[]>).subscribe((shops) => {
      const winkels: Winkel[] = [];
      shops.forEach((shop: Shop) => {
        winkels.push(this.mapShopToWinkel(shop));
      });
      this.winkels.set(winkels);
      this.shopsFetched.set(true);
      this.allDataFetched.set(
        this.alleCategorien() && this.categoriesFetched() && this.shopsFetched(),
      );
    });
  }

  getBesteldeProducten(): Product[] {
    return this.alleProducten().filter((product: Product) => product.aantalBesteld > 0);
  }

  getCategorienSorted(): Categorie[] {
    return this.alleCategorien().sort((a, b) => {
      if (a.omschrijving < b.omschrijving) return -1;
      if (a.omschrijving > b.omschrijving) return 1;
      return 0;
    });
  }

  getWinkelsSorted(): Winkel[] {
    return this.alleWinkels().sort((a, b) => {
      if (a.naam < b.naam) return -1;
      if (a.naam > b.naam) return 1;
      return 0;
    });
  }

  sortProducts(producten: Product[]): Product[] {
    return producten.sort((a, b) => {
      const locA =
        a.categorie && typeof a.categorie.locatie === 'number' ? a.categorie.locatie : null;
      const locB =
        b.categorie && typeof b.categorie.locatie === 'number' ? b.categorie.locatie : null;

      if (locA !== locB) {
        if (locA === null) return 1; // a heeft geen locatie/categorie, dus b komt eerst
        if (locB === null) return -1; // b heeft geen locatie/categorie, dus a komt eerst
        return locA - locB; // Numerieke sortering (laag naar hoog)
      }

      const descA = (a.omschrijving || '').toUpperCase();
      const descB = (b.omschrijving || '').toUpperCase();

      if (descA < descB) return -1;
      if (descA > descB) return 1;

      return 0; // Alles is gelijk
    });
  }

  async updatePickedProduct(id?: string, picked?: boolean) {
    const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + id);
    await updateDoc(docRef, { picked: picked })
      .then(() => {
        // Todo: update signal
      })
      .catch((error) => console.error('Error updating document: ', error));
  }

  async resetOrderedAndPickedProduct() {
    this.getBesteldeProducten().forEach((product: Product) => {
      if (product.aantalBesteld > 0 && product.picked === true) {
        try {
          const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + product.id);
          updateDoc(docRef, {
            picked: false,
            ordered: 0,
          });
        } catch (error) {
          console.error('Error updating document: ', error);
        }
      }
    });
    return null;
  }

  async addProduct(product: Product) {
    product.wijzigdatum = new Timestamp(new Date().getTime() / 1000, 0);
    product.aantalBesteld = 0;
    product.picked = false;
    const article: Article = this.mapProductToArticle(product);
    delete article.id;
    console.log('article..........');
    console.log(article);

    try {
      const colRef = collection(this.firestore, 'Users/' + this.queryUser + '/Articles/');
      const docRef = await addDoc(colRef, article);
      // .then((result) => {    })
      console.log('docRef');
      console.log(docRef.id);
      product.id = docRef.id;
      if (!this.producten().some((p) => p.id === product.id)) {
        this.producten.update((values) => {
          return this.sortProducts([...values, product]);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateArticle(gewijzigdProduct: Product) {
    try {
      gewijzigdProduct.wijzigdatum = new Timestamp(new Date().getTime() / 1000, 0);
      const article: Article = this.mapProductToArticle(gewijzigdProduct);
      const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + article.id);
      await updateDoc(docRef, {
        brand: article.brand,
        category: article.category,
        dateModified: article.dateModified,
        description: article.description,
        price: article.price,
        shop: article.shop,
        specialOffer: article.specialOffer,
        uom: article.uom,
        opmerking: article.opmerking,
      });
      this.producten.update((currentProducten) => {
        const gewijzigdeProductenLijst = currentProducten.map((product) =>
          product.id === gewijzigdProduct.id ? gewijzigdProduct : product,
        );
        return this.sortProducts(gewijzigdeProductenLijst);
      });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
    return null;
  }

  async updateOrderdProduct(id?: string, ordered?: number) {
    try {
      const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + id);
      await updateDoc(docRef, {
        ordered: ordered,
        picked: false,
      });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
    return null;
  }

  async deleteProcduct(id?: string) {
    // 1. Maak een referentie naar het specifieke document
    const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + id);

    try {
      // 2. Verwijder het document
      await deleteDoc(docRef);
      this.producten.update((currentProducts) => currentProducts.filter((p) => p.id !== id));
      console.log('Document succesvol verwijderd!');
    } catch (error) {
      console.error('Fout bij het verwijderen van het document: ', error);
    }
  }

  private mapProductToArticle(product: Product): Article {
    return {
      id: product.id,
      brand: this.toUppercase(product.merk),
      category: this.mapCategorieToCategory(product.categorie),
      dateModified: product.wijzigdatum,
      description: this.toUppercase(product.omschrijving),
      ordered: product.aantalBesteld,
      picked: product.picked,
      price: product.prijs,
      shop: this.mapWinkelToShop(product.winkel),
      specialOffer: product.aanbieding,
      uom: product.eenheid,
      opmerking: this.toUppercase(product.opmerking),
    };
  }

  private mapArticleToProduct(article: Article): Product {
    return {
      id: article.id,
      merk: article.brand,
      categorie: this.mapCategoryToCategorie(article.category),
      wijzigdatum: article.dateModified,
      omschrijving: article.description,
      aantalBesteld: article.ordered,
      picked: article.picked,
      prijs: article.price,
      winkel: this.mapShopToWinkel(article.shop),
      aanbieding: article.specialOffer,
      eenheid: article.uom,
      opmerking: article.opmerking,
    };
  }

  private mapWinkelToShop(winkel: Winkel): Shop {
    return {
      id: winkel.id,
      dateModified: winkel.wijzigdatum,
      name: winkel.naam,
    };
  }

  private mapShopToWinkel(shop: Shop): Winkel {
    return {
      id: shop.id,
      wijzigdatum: shop.dateModified,
      naam: shop.name,
    };
  }

  private mapCategoryToCategorie(category: Category): Categorie {
    return {
      wijzigdatum: category.dateModified, // new Timestamp(new Date().getTime() / 1000, 0),
      // wijzigdatum: category.dateModified || new Timestamp(new Date().getTime() / 1000, 0),
      omschrijving: category.description,
      locatie: category.location,
    };
  }

  private mapCategorieToCategory(categorie: Categorie): Category {
    return {
      dateModified: categorie.wijzigdatum,
      description: categorie.omschrijving,
      location: categorie.locatie,
    };
  }

  private toUppercase(value: string): string {
    if (!value || value.length === 0) {
      return value;
    }
    return value[0].toUpperCase() + value.slice(1);
  }
}
