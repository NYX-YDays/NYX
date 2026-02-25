import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ad } from '../../models/ad';
import { AdService } from '../../services/ad.services';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AddApproachModalComponent
} from '../../../approaches/components/add-approach-modal/add-approach-modal.component';

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styleUrl: './ad-detail.component.scss',
  imports: [DatePipe, TranslatePipe, AddApproachModalComponent, RouterLink],
  standalone: true
})
export class AdDetailComponent implements OnInit {

  //region fields

  protected ad: Ad | null = null;

  protected isLoading = true;

  /** If the current user is authenticated. */
  protected isAuthenticated = false;

  //endregion

  //region injections

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  constructor(
    private adService: AdService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  //endregion

  //region methods

  async ngOnInit() {
    // Récupérer l'ID de l'annonce depuis l'URL
    const adId = this.route.snapshot.paramMap.get('id');

    // Get if current user is authenticated
    this.isAuthenticated = !!this.adService.getCurrentUserIdentity();

    if (adId) {
      await this.loadAd(+adId); // Convertir en nombre
    } else {
      this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.DETAIL_PAGE.NO_ID_ADS"), 2);
      await this.router.navigate(['/ads']);
    }
  }

  async loadAd(id: number) {
    this.isLoading = true;

    try {
      this.ad = await this.adService.getAdById(id);
      this.isLoading = false;
    } catch (e) {
      this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.DETAIL_PAGE.ADS_ERROR"), 2);
      this.isLoading = false;
      await this.router.navigate(['/ads']); // Redirection vers la liste en cas d'erreur
    }
  }

  async goBack() {
    await this.router.navigate(['/ads']);
  }

  //endregion

}
