import { inject, Injectable, signal } from '@angular/core';
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
  setDoc,
} from '@angular/fire/firestore';
import { User } from '../auth/user.model';
import { Auth, authState } from '@angular/fire/auth';
import { Article, Categorie, Category, OrderedArticle, Product, Shop, Winkel } from './model';
import { Observable, of, switchMap, filter } from 'rxjs';

const DESC = 1;
const ASC = -1;
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private producten = signal<Product[]>([]);
  private categorien = signal<Categorie[]>([]);
  private winkels = signal<Winkel[]>([]);
  private orderedArticles = signal<OrderedArticle[]>([]);

  private queryUser: string = '';
  private sorteervolgorde: string = localStorage.getItem('sortsequence') || 'LOCATIE'; // 'LOCATIE';

  alleProducten = this.producten.asReadonly();
  alleCategorien = this.categorien.asReadonly();
  alleWinkels = this.winkels.asReadonly();
  articlesFetched = signal(false);
  categoriesFetched = signal(false);
  shopsFetched = signal(false);
  orderedArticlesFetched = signal(false);
  allDataFetched = signal<boolean>(false);

  constructor() {
    authState(this.auth)
      .pipe(
        switchMap((user) => {
          console.log('Gebruiker is ingelogd');
          if (user) {
            // Gebruiker is ingelogd (of hersteld na F5)! Haal nu de data op.
            return this.initData();
          } else {
            console.log('Niet ingelogd, reset de data');
            return of(null);
          }
        }),
      )
      .subscribe();
  }

  async initData() {
    try {
      const userRef = collection(this.firestore, 'Users');
      const querySnapshot = await getDocs(userRef);
      querySnapshot.forEach((doc) => {
        const user = { ...(doc.data() as User), id: doc.id };
        if (user.firebaseUID === this.auth.currentUser?.uid) {
          this.queryUser = user.id;
          this.fetchProducten();
          this.fetchCategorien();
          this.fetchWinkels();
          this.fetchOrderedArticles();
        }
      });
    } catch (error) {
      console.log('geen user');
      console.log(error);
    }
    return null;
  }

  async fetchProducten(): Promise<void> {
    try {
      const articleRef = collection(this.firestore, 'Users', this.queryUser, 'Articles');
      const querySnapshot = await getDocs(articleRef);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const article = { ...(doc.data() as Article), id: doc.id };
        products.push(this.mapArticleToProduct(article));
      });
      this.producten.set(this.sortProducts(products));
      this.articlesFetched.set(true);
      this.allDataFetched.set(
        this.alleCategorien() &&
          this.categoriesFetched() &&
          this.shopsFetched() &&
          this.categoriesFetched(),
      );
      console.log('aantal producten: ' + this.producten().length);
    } catch (error) {
      console.error('Fout bij ophalen producten:', error);
    }
  }

  fetchCategorien(): void {
    const categoryRef = collection(this.firestore, 'Users', this.queryUser, 'Categories');
    (collectionData(categoryRef, { idField: 'id' }) as Observable<Category[]>).subscribe(
      (categories) => {
        const categorien: Categorie[] = [];
        categories.forEach((category: Category) => {
          categorien.push(this.mapCategoryToCategorie(category));
        });
        this.categorien.set(categorien);
        this.categoriesFetched.set(true);
        this.allDataFetched.set(
          this.alleCategorien() &&
            this.categoriesFetched() &&
            this.shopsFetched() &&
            this.categoriesFetched(),
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
        this.alleCategorien() &&
          this.categoriesFetched() &&
          this.shopsFetched() &&
          this.categoriesFetched(),
      );
    });
  }

  fetchOrderedArticles(): void {
    // const userId = queryUser ? queryUser : 'unknown'
    const shopRef = collection(this.firestore, 'Users', this.queryUser, 'OrderedArticles');
    collectionData(shopRef, { idField: 'id' }).subscribe((orderedArticles: any) => {
      this.orderedArticles.set(orderedArticles);
      this.orderedArticlesFetched.set(true);
      this.allDataFetched.set(
        this.alleCategorien() &&
          this.categoriesFetched() &&
          this.shopsFetched() &&
          this.categoriesFetched(),
      );
    });
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

  setSorteerVolgorde(
    sorteervolgorde: 'LOCATIE' | 'DATUM-ON' | 'DATUM-NO' | 'WINKEL-AZ' | 'WINKEL-ZA',
  ) {
    this.sorteervolgorde = sorteervolgorde;
    localStorage.setItem('sortsequence', sorteervolgorde);
    const sorted = this.sortProducts(this.producten());
    this.producten.update((values) => sorted);
  }

  updateOrderedArticle(product: Product) {
    if (product.id && product.aantalBesteld === 0) {
      this.deleteOrderedArticle(product.id);
    } else {
      this.updateNumberOfOrderedProducts(product);
    }
  }

  async updateNumberOfOrderedProducts(orderedProduct: Product) {
    // const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/OrderedArticles/' + orderedProduct.id );

    const docRef = collection(this.firestore, 'Users/' + this.queryUser + '/OrderedArticles/');
    const result = setDoc(doc(docRef, orderedProduct.id), {
      numberOrdered: orderedProduct.aantalBesteld,
      picked: orderedProduct.picked,
    });
  }

  async updatePickedOrderedArticle(product: Product) {
    const docRef = doc(
      this.firestore,
      'Users/' + this.queryUser + '/OrderedArticles/' + product.id,
    );

    await updateDoc(docRef, { picked: product.picked })
      .then((result) => {
        // this.producten.update((currentProducten) =>
        //   currentProducten.map((currentProduct) =>
        //     currentProduct.id == orderedProduct.id ? orderedProduct : currentProduct,
        //   ),
        // );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async deleteOrderedArticle(id: string) {
    const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/OrderedArticles/' + id);

    try {
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Fout bij het verwijderen van OrederedArticle: ', error);
    }
  }

  getBesteldeProducten(): Product[] {
    const all: Product[] = this.alleProducten();
    const ordered: OrderedArticle[] = this.orderedArticles();

    const articleMap = new Map(all.map((article) => [article.id, article]));

    const besteldeProducten = ordered.map((ordered) => {
        const product = articleMap.get(ordered.id);
        if (!product) return null;
        return {
          ...product,
          aantalBesteld: ordered.numberOrdered,
          picked: ordered.picked,
        };
      })
      .filter((product): product is Product => !!product);
      // sort
      return this.sortProducts(besteldeProducten);
  }

  getAllProductsWithNumberOrdered() {
    const all: Product[] = this.alleProducten();
    const ordered: OrderedArticle[] = this.orderedArticles();

    const orderedMap = new Map(
      ordered.map((orderedArticle) => [orderedArticle.id, orderedArticle]),
    );

    return all.map((all) => {
      const orderedArticle = orderedMap.get(all.id);
      if (!orderedArticle) {
        all.aantalBesteld = 0;
        return all;
      }
      return {
        ...all,
        aantalBesteld: orderedArticle.numberOrdered,
        picked: orderedArticle.picked,
      };
    });
    // .filter((product): product is Product => !!product);
  }

  async resetOrderedAndPickedProduct() {  
    this.orderedArticles().forEach((orderedArticel: OrderedArticle) => {
      if (orderedArticel.picked && orderedArticel.id) {
        this.deleteOrderedArticle(orderedArticel.id)
      }
    })
  }

  async addProduct(selectedProduct: Product) {
    selectedProduct.wijzigdatum = new Timestamp(new Date().getTime() / 1000, 0);
    selectedProduct.aantalBesteld = 0;
    selectedProduct.picked = false;
    const article: Article = this.mapProductToArticle(selectedProduct);
    delete article.id;

    try {
      const colRef = collection(this.firestore, 'Users/' + this.queryUser + '/Articles/');
      const docRef = await addDoc(colRef, article);
      // .then((result) => {    })
      selectedProduct.id = docRef.id;
      if (!this.producten().some((p) => p.id === selectedProduct.id)) {
        this.producten.update((values) => {
          return this.sortProducts([...values, selectedProduct]);
          return this.sortProducts([...values, selectedProduct]);
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

  async deleteProcduct(id?: string) {
    const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + id);

    try {
      await deleteDoc(docRef);
      this.producten.update((currentProducts) => currentProducts.filter((p) => p.id !== id));
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

  private sortProducts(products: Product[]): Product[] {
    switch (this.sorteervolgorde) {
      case 'LOCATIE': {
        const sorted = this.sortByLocatie(products);
        return sorted;
      }
      case 'DATUM-ON': {
        return this.sortByDate(products, ASC);
      }
      case 'DATUM-NO': {
        return this.sortByDate(products, DESC);
      }
      case 'WINKEL-AZ': {
        return this.sortByWinkel(products, ASC);
      }
      case 'WINKEL-ZA': {
        return this.sortByWinkel(products, DESC);
      }
      default: {
        console.log('ignore');
        return products;
      }
    }
  }

  private sortByLocatie(producten: Product[]): Product[] {
    const sorted = producten.sort((a, b) => {
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

      return 0;
    });
    return sorted;
  }

  private sortByDate(producten: Product[], order: 1 | -1): Product[] {
    const sorted = producten.sort((a, b) => {
      if (a.wijzigdatum === null) return 1 * order;
      if (b.wijzigdatum === null) return -1 * order;

      if (a.wijzigdatum.toMillis() !== b.wijzigdatum.toMillis()) {
        if (a.wijzigdatum < b.wijzigdatum) return 1 * order;
        if (a.wijzigdatum > b.wijzigdatum) return -1 * order;
      }
      if (a.omschrijving < b.omschrijving) return 1;
      if (a.omschrijving > b.omschrijving) return -1;

      return 0;
    });
    return sorted;
  }

  private sortByWinkel(producten: Product[], order: 1 | -1): Product[] {
    const sorted = producten.sort((a, b) => {
      if (a.winkel?.naam === null) return 1 * order;
      if (b.winkel?.naam === null) return -1 * order;

      if (a.winkel.naam !== b.winkel.naam) {
        if (a.winkel.naam < b.winkel.naam) return 1 * order;
        if (a.winkel.naam > b.winkel.naam) return -1 * order;
      }
      if (a.omschrijving < b.omschrijving) return -1;
      if (a.omschrijving > b.omschrijving) return 1;

      return 0;
    });
    return sorted;
  }
}
