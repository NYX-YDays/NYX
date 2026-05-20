import { Component, inject, OnInit, signal } from '@angular/core';
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

  protected ad = signal(new Ad());

  protected isLoading = signal(true);

  /** If the current user is authenticated. */
  protected isAuthenticated = signal(false);

  /** If the ad belongs to the current user. */
  protected isCurrentUserAd = signal(false);

  //endregion

  //region injections

  private adService = inject(AdService);

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  //endregion

  //region methods

  async ngOnInit() {
    // Récupérer l'ID de l'annonce depuis l'URL
    const adId = this.route.snapshot.paramMap.get('id');

    const userIdentity = this.adService.getCurrentUserIdentity();

    // Get if current user is authenticated
    this.isAuthenticated.set(!!userIdentity);

    if (adId) {
      await this.loadAd(+adId); // Convertir en nombre
    } else {
      this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.DETAIL_PAGE.NO_ID_ADS"), 2);
      await this.router.navigate(['/ads']);
    }

    if (this.isAuthenticated()) this.isCurrentUserAd.set(this.ad()?.user?.id == userIdentity?.id);
  }

  async loadAd(id: number) {
    this.isLoading.set(true);

    try {
      this.ad.set(await this.adService.getAdByIdAsync(id));
      this.isLoading.set(false);
    } catch (e) {
      this.isLoading.set(false);
      await this.router.navigate(['/ads']); // Redirection vers la liste en cas d'erreur
    }
  }

  async goBack() {
    await this.router.navigate(['/ads']);
  }

  //endregion

}
