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

  selectedCategoryId = NaN;

  isLoading = true;

  protected readonly NaN = NaN;

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  constructor(private adService: AdService) {
  }

  async ngOnInit() {
    try {
      this.categories = await this.adService.getAllCategories();
      await this.loadAds();
    } catch (e) {
      this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.LISTING_PAGE.CATEGORIES_ERROR"), 2);
      this.isLoading = false;
    }
  }

  async loadAds(categoryId = NaN) {
    this.isLoading = true;

    try {
      this.ads = await this.adService.getAds(categoryId);
      this.isLoading = false;
    } catch (e) {
      this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.LISTING_PAGE.ADS_ERROR"), 2);
      this.isLoading = false;
    }
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
