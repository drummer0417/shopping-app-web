import { AfterRenderRef, Component, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { getAuth } from '@angular/fire/auth';
import { Router, provideRouter, RouterOutlet, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FirestoreService } from '../data/data.service';
@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-producten',
  styleUrl: './producten.css',
  templateUrl: './producten.html',
})
export class Producten {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  allAricles = this.firestoreService.alleProducten;


  form = new FormGroup({
    // omschrijving: new FormControl('', { validators: [Validators.required] }),
    // aantal: new FormControl('', { validators: [Validators.required] }),
  });

  onGetAllUsers() {
    console.log(this.allAricles());
  }
  
  onGetOrderdArticles() {
    console.log(this.firestoreService.alleProducten());
  }

  // onDeleteArticle() {
  //   console.log('logged in user');
  //   console.log(this.articleService.users);
  // }

  // onGetQueryUsert() {
  //   this.articleService.getQueryUser();
  // }

  // onGetArticles() {
  //   this.articleService.initArticles();
  // }
}
