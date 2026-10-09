import { Component, inject, OnInit } from '@angular/core';
import { FirestoreService } from '../data/data.service';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
 firestoreService = inject(FirestoreService);
   private router = inject(Router);

    ngOnInit(): void {
    if (!this.firestoreService.alleProducten() || this.firestoreService.alleProducten().length === 0) {
      this.firestoreService.initData();
            // this.router.navigate(['home']);
    }
  }
}
