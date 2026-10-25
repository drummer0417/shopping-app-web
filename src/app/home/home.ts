import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  imports: [MatSidenavModule, MatSidenavModule, MatProgressSpinnerModule, MatProgressBarModule],
  selector: 'app-home',
  styleUrl: './home.scss',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  dataService = inject(DataService);
  private router = inject(Router);

  ngOnInit(): void {
    // if (
    //   !this.dataService.alleProducten() ||
    //   this.dataService.alleProducten().length === 0
    // ) {
    //   this.dataService.initData();
    //   // this.router.navigate(['home']);
    // }
    // // this.dataService.initData();
  }
}
