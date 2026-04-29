import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Ad } from '../../models/ad';
import { AdService } from '../../services/ad.services';

@Component({
  selector: 'app-service-provider-ad-list',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './service-provider-ad-list.component.html',
  styleUrl: './service-provider-ad-list.component.scss'
})
export class ServiceProviderAdListComponent implements OnInit {

  //region fields

  /** If the component is loading. */
  protected isLoading = signal(true);

  /** Current user ads. */
  protected ads = signal(new Array<Ad>());

  //endregion

  //region injections

  private adService = inject(AdService);

  //endregion

  //region methods

  async ngOnInit() {
    this.ads.set(await this.adService.getCurrentUserAdsAsync());
    this.isLoading.set(false);
  }

  //endregion

}
