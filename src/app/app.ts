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
  provideRouter,
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
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatSidenavModule,
    RouterLink,
    MatToolbarModule,
    // Toolbar
],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  breadcrumb = 'Home'; // default fallback`
  selectedColor: 'green' | 'red' | 'blue' = 'green'; // default
  selectedMode: 'light' | 'dark' = 'light';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    public themeService: ThemeService,
    public loaderService: LoaderService,
  ) {
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
