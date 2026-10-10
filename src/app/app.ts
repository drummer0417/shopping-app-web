import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth/auth.service';
import { getAuth } from '@angular/fire/auth';
import { Router, provideRouter, RouterOutlet } from '@angular/router';
import { Nav } from './nav/nav';
import { Producten } from './producten/producten';
import { Toolbar } from './toolbar/toolbar';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, Nav, RouterOutlet, Toolbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  
}
