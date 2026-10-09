import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { App } from './app';
import { Login } from './login/login';
import { Producten } from './producten/producten';
import { BoodschappenLijst } from './boodschappen-lijst/boodschappen-lijst';
import { InWinkel } from './in-winkel/in-winkel';
import { Home } from './home/home';


export const routes: Routes = [
  { path: '', component: App, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'boodschappenlijst', component: BoodschappenLijst, canActivate: [authGuard] },
  { path: 'producten', component: Producten, canActivate: [authGuard] },
  { path: 'in-winkel', component: InWinkel, canActivate: [authGuard] },
  { path: '**', component: Producten },
];

