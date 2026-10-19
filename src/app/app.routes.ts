import { Routes } from '@angular/router';
import { BoodschappenLijst } from './boodschappenlijst/boodschappenlijst';
import { App } from './app';
import { authGuard } from './auth.guard';
import { Home } from './home/home';
import { InWinkel } from './winkel/in-winkel/in-winkel';
import { Login } from './login/login';
import { Logoff } from './logoff/logoff';
import { PageNotFound } from './page-not-found/page-not-found';
import { Producten } from './product/producten/producten';


export const routes: Routes = [
  { path: '', component: App, canActivate: [authGuard] },
  { path: 'login', component: Login, data: { breadcrumb: 'Login' }},
  { path: 'logoff', component: Logoff, data: { breadcrumb: 'Logoff' }},
  { path: 'home', component: Home, canActivate: [authGuard], data: { breadcrumb: 'Home' }},
  { path: 'boodschappenlijst', component: BoodschappenLijst, canActivate: [authGuard], data: { breadcrumb: 'Lijstje maken' }},
  { path: 'producten', component: Producten, canActivate: [authGuard], data: { breadcrumb: 'Producten' } },
  { path: 'in-winkel', component: InWinkel, canActivate: [authGuard], data: { breadcrumb: 'In de winkel' }},
  { path: '**', component: PageNotFound, data: { breadcrumb: '404' } } ,
];

