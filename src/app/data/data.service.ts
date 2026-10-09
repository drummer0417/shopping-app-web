import { computed, inject, Injectable, signal } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  doc,
  addDoc,
  deleteDoc,
  DocumentReference,
  query,
  querySnapshotFromJSON,
  updateDoc,
} from '@angular/fire/firestore';
import {
  AngularFirestoreCollection,
  CollectionReference,
  DocumentData,
} from '@angular/fire/compat/firestore';
import { User } from '../auth/user.model';
import { Auth } from '@angular/fire/auth';
import { Article, Category, Shop } from './model';
import { Login } from '../login/login';
import { filter } from 'rxjs';
import { update } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private producten = signal<Article[]>([]);
  private categories = signal<Category[]>([]);
  private orderedArticles = signal<Category[]>([]);
  private winkels = signal<Shop[]>([]);
  private queryUser: string = '';

  alleProducten = this.producten.asReadonly();
  allCategories = this.categories.asReadonly();
  allShops = this.winkels.asReadonly();

  initData(): void {
    const productsRef = collection(this.firestore, 'Users');
    collectionData(productsRef, { idField: 'id' }).subscribe((users: any) => {
      this.getQueryUser(users);
    });
  }

  getQueryUser(users: User[]) {
    users.forEach((user: User) => {
      if (user.firebaseUID === this.auth.currentUser?.uid) {
        this.queryUser = user.id;
        this.loadArticles();
        this.loadCategories();
        this.loadOrderdAticles();
        this.loadShops();
      }
    });
  }

  loadArticles(): void {
    const articleRef = collection(this.firestore, 'Users', this.queryUser, 'Articles');
    collectionData(articleRef, { idField: 'id' }).subscribe((articles: any) => {
      this.producten.set(articles);
    });
  }

  loadCategories(): void {
    const categoryRef = collection(this.firestore, 'Users', this.queryUser, 'Categories');
    collectionData(categoryRef, { idField: 'id' }).subscribe((categories: any) => {
      this.categories.set(categories);
    });
  }

  loadOrderdAticles(): void {
    const orderedAticlesRef = collection(
      this.firestore,
      'Users',
      this.queryUser,
      'OrderedArticles',
    );
    collectionData(orderedAticlesRef, { idField: 'id' }).subscribe((orderedArticles: any) => {
      this.orderedArticles.set(orderedArticles);
    });
  }

  loadShops(): void {
    // const userId = queryUser ? queryUser : 'unknown'
    const shopRef = collection(this.firestore, 'Users', this.queryUser, 'Shops');
    collectionData(shopRef, { idField: 'id' }).subscribe((shops: any) => {
      this.winkels.set(shops);
    });
  }

  loadOrderedArticles(): void {
    // const userId = queryUser ? queryUser : 'unknown'
    const shopRef = collection(this.firestore, 'Users', this.queryUser, 'OrderedArticles');
    collectionData(shopRef, { idField: 'id' }).subscribe((orderedArticles: any) => {
      this.winkels.set(orderedArticles);
    });
  }

  // Dit is de nieuwe, geoptimaliseerde en reactieve lijst:
  getBesteldeProcucten(): Article[] {
    const all = this.alleProducten();
    const ordered = this.orderedArticles();

    // Maak de snelle Map aan voor O(1) lookups
    const articleMap = new Map(all.map((article) => [article.id, article]));

    // Map en filter de resultaten direct
    return ordered
      .map((ord) => articleMap.get(ord.id))
      .filter((article): article is Article => !!article);
  }
  async updatePickedItem(id: string) {
    try {
      const docRef = doc(this.firestore, 'Users/' + this.queryUser + '/OrderedArticles/' + id);
      await updateDoc(docRef, { picked: true });

      //   const productsRef = collection(this.firestore, 'spullen');
      //   return addDoc(productsRef, article);
    } catch (error) {
      console.error('Error updating document: ', error);
    }
    return null;

    // addArticle(article: { omschrijving: string; aantal: number }): Promise<any> {
    //   const productsRef = collection(this.firestore, 'spullen');
    //   return addDoc(productsRef, article);
  }
  // addArticle(article: { omschrijving: string; aantal: number }) {
  //   return null;
  // // addArticle(article: { omschrijving: string; aantal: number }): Promise<any> {
  // //   const productsRef = collection(this.firestore, 'spullen');
  // //   return addDoc(productsRef, article);
  // }

  async deleteArticle(docId: string) {
    // 1. Maak een referentie naar het specifieke document
    const docRef = doc(this.firestore, 'spullen', docId);

    try {
      // 2. Verwijder het document
      await deleteDoc(docRef);
      console.log('Document succesvol verwijderd!');
    } catch (error) {
      console.error('Fout bij het verwijderen van het document: ', error);
    }
  }
}
