import { Component, inject, ɵgetInjectableDef, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-logoff',
  imports: [MatIconModule, RouterLink, MatToolbarModule],
  templateUrl: './logoff.html',
  styleUrl: './logoff.scss',
})
export class Logoff implements OnInit {
  authService = inject(AuthService);
  
  ngOnInit(): void {
    this.authService.logoff();
  }

}
