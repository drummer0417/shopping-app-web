import { Component, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { MatAnchor } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { DownloadService } from './download.service';
import { OrderedArticle } from '../data/model';

@Component({
  selector: 'app-download',
  imports: [MatAnchor],
  providers: [DatePipe],
  templateUrl: './download.html',
  styleUrl: './download.scss',
})
export class Download {
  dataService = inject(DataService);
  downloadService = inject(DownloadService);
  datePipe = inject(DatePipe);

  onDownloadArticles() {
    const articles = JSON.stringify(this.dataService.alleProducten());
    const filename = 'articles_' + this.now();
    this.downloadService.download(articles, filename);
  }

  onDownloadCategories() {
    const categories = JSON.stringify(this.dataService.getCategorienSorted());
    const filename = 'categories_' + this.now();
    this.downloadService.download(categories, filename);
  }

  onDownloadShops() {
    const shops = JSON.stringify(this.dataService.getWinkelsSorted());
    const filename = 'shops_' + this.now();
    this.downloadService.download(shops, filename);
  }

  onDownloadOrderedArticles() {
    const orderedArticles = JSON.stringify(this.dataService.getOrderedArticles());
    const filename = 'orderedArticles_' + this.now();
    this.downloadService.download(orderedArticles, filename);
  }

  private now() {
    return this.datePipe.transform(Date.now(), 'yyyyMMdd_hhmmss');
  }
}
