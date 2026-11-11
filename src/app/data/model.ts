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
  note: string;
}
export interface Category {
  id?: string;
  dateModified: Timestamp;
  description: string;
  location: number;
}
export interface Shop {
  id?: string;
  dateModified: Timestamp;
  name: string;
}
export interface OrderedArticle {
  id?: string;
  numberOrdered: number;
  picked: boolean;
}

export interface ShoppingListItem {
  description: string;
}
