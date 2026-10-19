import { Timestamp } from '@angular/fire/firestore';
import { TimestampProvider } from 'rxjs';

export interface Article {
  id?: string;
  brand: string;
  category: Category;
  dateModified: Timestamp;
  description: string;
  ordered: number;
  picked: boolean;
  price: number;
  shop: Shop;
  specialOffer: boolean;
  uom: string;
  opmerking: string;
}

export interface Product {
  id?: string;
  merk: string;
  categorie: Categorie;
  wijzigdatum: Timestamp;
  omschrijving: string;
  aantalBesteld: number;
  picked: boolean;
  prijs: number;
  winkel: Winkel;
  aanbieding: boolean;
  eenheid: string;
  opmerking: string;
}

export interface Category {
  dateModified: Timestamp;
  description: string;
  location: number;
}
export interface Categorie {
  wijzigdatum: Timestamp;
  omschrijving: string;
  locatie: number;
}

export interface Shop {
  id?: string;
  dateModified: Timestamp;
  name: string;
}


export interface Winkel {
  id?: string;
  wijzigdatum: Timestamp;
  naam: string;
}
export interface ShoppingListItem {
   description: string;
   
}
