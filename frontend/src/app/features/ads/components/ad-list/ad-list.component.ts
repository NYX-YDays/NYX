import { Component, inject, OnInit } from '@angular/core';
import { Ad } from '../../models/ad';
import { Category } from '../../models/category';
import { AdService } from '../../services/ad.services';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ad-list',
  templateUrl: './ad-list.component.html',
  styleUrl: './ad-list.component.scss',
  imports: [DatePipe, FormsModule, TranslatePipe, RouterModule], 
  standalone: true 
})

export class AdListComponent implements OnInit {
  ads: Ad[] = []; 
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  isLoading = false; 

  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  constructor(private adService: AdService) { } 

  ngOnInit(): void {
      this.adService.getAllCategories().subscribe({
        next: (categories: Category[]) => {
          this.categories = categories;
          this.loadAds(); 
        },
        error: () => {
          this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.LISTING_PAGE.CATEGORIES_ERROR"), 2);
          this.isLoading = false;
        }
      });
  }

  loadAds(categoryId: number | null = null): void {
    this.isLoading = true;

    const params = categoryId ? { category: categoryId } : {};

    this.adService.getAds(params).subscribe({
      next: (ads: Ad[]) => {
        this.ads = ads; 
        this.isLoading = false;
      },
      error: () => {
        this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.LISTING_PAGE.ADS_ERROR"), 2);
        this.isLoading = false; 
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  onCategoryChange(): void {
    // Recharger les annonces en fonction de la catégorie sélectionnée
    this.loadAds(this.selectedCategoryId);
  }
}
