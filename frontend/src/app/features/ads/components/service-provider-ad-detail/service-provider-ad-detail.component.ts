import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdService } from '../../services/ad.services';
import { AlertService } from '../../../../shared/services/alert.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Ad } from '../../models/ad';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { DatePipe } from '@angular/common';
import {
  SeeApproachModalComponent
} from '../../../approaches/components/see-approach-modal/see-approach-modal.component';
import { AdEditingFormComponent } from '../ad-editing-form/ad-editing-form.component';

@Component({
  selector: 'app-service-provider-ad-detail',
  imports: [
    DatePipe,
    RouterLink,
    SeeApproachModalComponent,
    TranslatePipe,
    AdEditingFormComponent
  ],
  templateUrl: './service-provider-ad-detail.component.html',
  styleUrl: './service-provider-ad-detail.component.scss'
})
export class ServiceProviderAdDetailComponent implements OnInit {

  //region fields

  /** AD to display info from. */
  protected ad = signal(new Ad());

  /** If the component is loading. */
  protected isLoading = signal(true);

  /** If the ad editing form must be displayed. */
  protected showEditForm = signal(false);

  //endregion

  //region injections

  private activatedRoute = inject(ActivatedRoute);

  private adService = inject(AdService);

  private alertService = inject(AlertService);

  private router = inject(Router);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  async ngOnInit() {
    this.showEditForm.set(false);
    this.isLoading.set(true);
    const adId = (Number)(this.activatedRoute.snapshot.paramMap.get('id'));
    this.ad.set(await this.adService.getAdByIdAsync(adId));
    this.isLoading.set(false);
  }

  /** Delete current ad after confirmation. */
  protected async confirmEventDeletionAsync() {
    this.alertService.showConfirmation(
      async () => {
        await this.adService.deleteAdAsync(this.ad().id);
        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('ADS.SERVICE_PROVIDER_DETAIL_PAGE.DELETE_SUCCESS_MESSAGE'),
          7
        );
        await this.router.navigateByUrl(`/my-ads`);
      },
      this.translateService.instant('ADS.SERVICE_PROVIDER_DETAIL_PAGE.DELETE_CONFIRM_MESSAGE')
    );
  }

  //endregion

}
