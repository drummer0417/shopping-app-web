import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from './auth/auth.service';
import { getAuth } from '@angular/fire/auth';
import {
  Router,
  RouterOutlet,
  RouterLink,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { LoaderService } from './services/loader.service';
import { ThemeService } from './services/theme.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from './data/data.service';
import { MatLabel, MatSelect } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatLabel,
    MatListModule,
    MatOptionModule,
    MatRadioModule,
    MatSidenavModule,
    MatSidenavModule,
    RouterLink,
    MatToolbarModule,
    MatSelect
],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  breadcrumb = 'Home';
  selectedColor: 'green' | 'red' | 'blue' = 'green'; // default
  selectedMode: 'light' | 'dark' = 'light';
  dataService = inject(DataService);
  themeService = inject(ThemeService);
  loaderService = inject(LoaderService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  title = inject(Title);
  sorteervolgorde  = 'LOCATIE'

  constructor() {
    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => {
      const child = this.getChild(this.route);
      child.data.subscribe((data) => {
        this.breadcrumb = data['breadcrumb'] || 'Winkelwagen  ';
        this.title.setTitle(this.breadcrumb);
      });
    });
    this.selectedColor = this.themeService.color();
    this.selectedMode = this.themeService.mode();
  }

  getChild(route: ActivatedRoute): ActivatedRoute {
    if (route.firstChild) {
      return this.getChild(route.firstChild);
    }
    return route;
  }
}
