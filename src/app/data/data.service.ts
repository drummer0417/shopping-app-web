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
import { Article, Category, OrderedArticle, Shop } from './model';
import { Observable, of, switchMap, filter } from 'rxjs';

const DESC = 1;
const ASC = -1;
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private articles = signal<Article[]>([]);
  private categories = signal<Category[]>([]);
  private shops = signal<Shop[]>([]);
  private orderedArticles = signal<OrderedArticle[]>([]);

  private queryUser: string = '';

  sortSequence = signal<string>(localStorage.getItem('sortsequence') || 'LOCATIE');
  allArticless = this.articles.asReadonly();
  allCategories = this.categories.asReadonly();
  allShops = this.shops.asReadonly();
  articlesFetched = signal(false);
  categoriesFetched = signal(false);
  shopsFetched = signal(false);
  orderedArticlesFetched = signal(false);
  allDataFetched = signal<boolean>(false);
  totalAmountOrderd = signal<number>(0);

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

  private async initData() {
    try {
      const userRef = collection(this.firestore, 'Users');
      const querySnapshot = await getDocs(userRef);
      querySnapshot.forEach((doc) => {
        const user = { ...(doc.data() as User), id: doc.id };
        if (user.firebaseUID === this.auth.currentUser?.uid) {
          this.queryUser = user.id;
          this.fetchArticles();
          this.fetchCategorien();
          this.fetchShops();
          this.fetchOrderedArticles();
        }
      });
    } catch (error) {
      console.log('geen user');
      console.log(error);
    }
    return null;
  }

  private async fetchArticles(): Promise<void> {
    try {
      const articleRef = collection(this.firestore, 'Users', this.queryUser, 'Articles');
      const querySnapshot = await getDocs(articleRef);
      const articles: Article[] = [];

      querySnapshot.forEach((doc) => {
        const article = { ...(doc.data() as Article), id: doc.id };
        articles.push(article);
      });
      this.articles.set(this.sortArticles(articles));
      this.articlesFetched.set(true);
      this.allDataFetched.set(
        this.allCategories() &&
          this.categoriesFetched() &&
          this.shopsFetched() &&
          this.categoriesFetched(),
      );
      this.articles().forEach((article) => {
        if (!article.category.id) {
          console.log(article);
        }
      });
      console.log('# articles: ' + this.articles().length);
    } catch (error) {
      console.error('Fout bij ophalen articles:', error);
    }
  }

  private fetchCategorien(): void {
    const categoryRef = collection(this.firestore, 'Users', this.queryUser, 'Categories');
    (collectionData(categoryRef, { idField: 'id' }) as Observable<Category[]>).subscribe(
      (categories) => {
        this.categories.set(categories);
        this.categoriesFetched.set(true);
        this.allDataFetched.set(
          this.allCategories() &&
            this.categoriesFetched() &&
            this.shopsFetched() &&
            this.categoriesFetched(),
        );
      },
    );
  }

  private fetchShops(): void {
    // const userId = queryUser ? queryUser : 'unknown'
    const shopRef = collection(this.firestore, 'Users', this.queryUser, 'Shops');
    // collectionData(shopRef, { idField: 'id' }).subscribe((shops: any) => {
    (collectionData(shopRef, { idField: 'id' }) as Observable<Shop[]>).subscribe((shops) => {
      this.shops.set(shops);
      this.shopsFetched.set(true);
      this.allDataFetched.set(
        this.allCategories() &&
          this.categoriesFetched() &&
          this.shopsFetched() &&
          this.categoriesFetched(),
      );
    });
  }

  private fetchOrderedArticles(): void {
    // const userId = queryUser ? queryUser : 'unknown'
    const shopRef = collection(this.firestore, 'Users', this.queryUser, 'OrderedArticles');
    collectionData(shopRef, { idField: 'id' }).subscribe((orderedArticles: any) => {
      this.orderedArticles.set(orderedArticles);
      this.orderedArticlesFetched.set(true);
      this.allDataFetched.set(
        this.allCategories() &&
          this.categoriesFetched() &&
          this.shopsFetched() &&
          this.categoriesFetched(),
      );
    });
  }

  getCategoriesSorted(): Category[] {
    return this.allCategories().sort((a, b) => {
      if (a.description < b.description) return -1;
      if (a.description > b.description) return 1;
      return 0;
    });
  }

  getShopsSorted(): Shop[] {
    return this.allShops().sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }

  setSortSequence(sortSequence: 'LOCATIE' | 'DATUM-ON' | 'DATUM-NO' | 'WINKEL-AZ' | 'WINKEL-ZA') {
    this.sortSequence.set(sortSequence);
    localStorage.setItem('sortsequence', sortSequence);
    const sorted = this.sortArticles(this.articles());
    this.articles.update((values) => sorted);
  }

  updateOrderedArticle(article: Article) {
    if (article.id && article.ordered === 0) {
      this.deleteOrderedArticle(article.id);
    } else {
      this.updateNumberOfOrderedArticles(article);
    }
  }

  private async updateNumberOfOrderedArticles(orderedArticle: Article) {
    const docRef = collection(this.firestore, 'Users/' + this.queryUser + '/OrderedArticles/');
    const result = setDoc(doc(docRef, orderedArticle.id), {
      numberOrdered: orderedArticle.ordered,
      picked: orderedArticle.picked,
    }).catch((error) => {
      console.log(error);
    });
  }

  async updatePickedOrderedArticle(article: Article) {
    const docRef = doc(
      this.firestore,
      'Users/' + this.queryUser + '/OrderedArticles/' + article.id,
    );
    await updateDoc(docRef, { picked: article.picked })
      .then((result) => {})
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

  getOrderedArticles(): Article[] {
    const all: Article[] = this.allArticless();
    const ordered: OrderedArticle[] = this.orderedArticles();

    const articleMap = new Map(all.map((article) => [article.id, article]));

    const orderedArticles = ordered
      .map((ordered) => {
        const article = articleMap.get(ordered.id);
        if (!article) return null;
        return {
          ...article,
          ordered: ordered.numberOrdered,
          picked: ordered.picked,
        };
      })
      .filter((article): article is Article => !!article);
    // sort
    return this.sortArticles(orderedArticles);
  }

  getAllArticlesWithNumberOrdered() {
    const all: Article[] = this.allArticless();
    const ordered: OrderedArticle[] = this.orderedArticles();

    const orderedMap = new Map(
      ordered.map((orderedArticle) => [orderedArticle.id, orderedArticle]),
    );

    return all.map((all) => {
      const orderedArticle = orderedMap.get(all.id);
      if (!orderedArticle) {
        all.ordered = 0;
        return all;
      }
      return {
        ...all,
        ordered: orderedArticle.numberOrdered,
        picked: orderedArticle.picked,
      };
    });
  }

  async resetOrderedAndPickedArticles() {
    this.orderedArticles().forEach((orderedArticel: OrderedArticle) => {
      if (orderedArticel.picked && orderedArticel.id) {
        this.deleteOrderedArticle(orderedArticel.id);
      }
    });
  }

  async addArticle(newArticle: Article) {
    newArticle.dateModified = new Timestamp(new Date().getTime() / 1000, 0);
    newArticle.ordered = 0;
    newArticle.picked = false;
    delete newArticle.id;

    try {
      const colRef = collection(this.firestore, 'Users/' + this.queryUser + '/Articles/');
      const docRef = await addDoc(colRef, newArticle);
      // .then((result) => {    })
      newArticle.id = docRef.id;
      if (!this.articles().some((p) => p.id === newArticle.id)) {
        this.articles.update((values) => {
          return this.sortArticles([...values, newArticle]);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async updateArticle(updatedArticle: Article) {
    try {
      updatedArticle.dateModified = new Timestamp(new Date().getTime() / 1000, 0);

      const docRef = doc(
        this.firestore,
        'Users/' + this.queryUser + '/Articles/' + updatedArticle.id,
      );
      await updateDoc(docRef, {
        brand: updatedArticle.brand,
        category: updatedArticle.category,
        dateModified: updatedArticle.dateModified,
        description: updatedArticle.description,
        price: updatedArticle.price,
        shop: updatedArticle.shop,
        specialOffer: updatedArticle.specialOffer,
        uom: updatedArticle.uom,
        note: updatedArticle.note,
      });
      this.articles.update((currentArticles) => {
        const updatedArticleList = currentArticles.map((article) =>
          article.id === updatedArticle.id ? updatedArticle : article,
        );
        return this.sortArticles(updatedArticleList);
      });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
    return null;
  }

  async deleteArticle(id?: string) {
    const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/Articles/' + id);

    try {
      await deleteDoc(docRef);
      this.articles.update((currentArticles) => currentArticles.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Fout bij het verwijderen van het document: ', error);
    }
  }

  private toUppercase(value: string): string {
    if (!value || value.length === 0) {
      return value;
    }
    return value[0].toUpperCase() + value.slice(1);
  }

  private sortArticles(articles: Article[]): Article[] {
    switch (this.sortSequence()) {
      case 'LOCATIE': {
        const sorted = this.sortByLocatie(articles);
        return sorted;
      }
      case 'DATUM-ON': {
        return this.sortByDate(articles, ASC);
      }
      case 'DATUM-NO': {
        return this.sortByDate(articles, DESC);
      }
      case 'WINKEL-AZ': {
        return this.sortByWinkel(articles, ASC);
      }
      case 'WINKEL-ZA': {
        return this.sortByWinkel(articles, DESC);
      }
      default: {
        console.log('ignore');
        return articles;
      }
    }
  }

  private sortByLocatie(articles: Article[]): Article[] {
    const sorted = articles.sort((a, b) => {
      const locA =
        a.category && typeof a.category.location === 'number' ? a.category.location : null;
      const locB =
        b.category && typeof b.category.location === 'number' ? b.category.location : null;

      if (locA !== locB) {
        if (locA === null) return 1; // a heeft geen locatie/category, dus b komt eerst
        if (locB === null) return -1; // b heeft geen locatie/category, dus a komt eerst
        return locA - locB; // Numerieke sortering (laag naar hoog)
      }

      const descA = (a.description || '').toUpperCase();
      const descB = (b.description || '').toUpperCase();

      if (descA < descB) return -1;
      if (descA > descB) return 1;

      return 0;
    });
    return sorted;
  }

  private sortByDate(articles: Article[], order: 1 | -1): Article[] {
    const sorted = articles.sort((a, b) => {
      if (a.dateModified === null) return 1 * order;
      if (b.dateModified === null) return -1 * order;

      if (a.dateModified.toMillis() !== b.dateModified.toMillis()) {
        if (a.dateModified < b.dateModified) return 1 * order;
        if (a.dateModified > b.dateModified) return -1 * order;
      }
      if (a.description < b.description) return 1;
      if (a.description > b.description) return -1;
      if (a.description > b.description) return -1;

      return 0;
    });
    return sorted;
  }

  private sortByWinkel(articles: Article[], order: 1 | -1): Article[] {
    const sorted = articles.sort((a, b) => {
      if (a.shop?.name === null) return 1 * order;
      if (b.shop?.name === null) return -1 * order;

      if (a.shop.name !== b.shop.name) {
        if (a.shop.name < b.shop.name) return 1 * order;
        if (a.shop.name > b.shop.name) return -1 * order;
      }
      if (a.description < b.description) return -1;
      if (a.description > b.description) return 1;

      return 0;
    });
    return sorted;
  }
}
