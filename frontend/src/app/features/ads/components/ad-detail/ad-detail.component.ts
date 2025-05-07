import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ad } from '../../models/ad';
import { AdService } from '../../services/ad.services';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styleUrl: './ad-detail.component.scss',
  imports: [DatePipe, TranslatePipe],
  standalone: true
})
export class AdDetailComponent implements OnInit {
  ad: Ad | null = null;
  isLoading = true;

  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  
  constructor(
    private adService: AdService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Récupérer l'ID de l'annonce depuis l'URL
    const adId = this.route.snapshot.paramMap.get('id');
    
    if (adId) {
      this.loadAd(+adId); // Convertir en nombre
    } else {
      this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.DETAIL_PAGE.NO_ID_ADS"), 2);
      this.router.navigate(['/ads']);
    }
  }

  loadAd(id: number): void {
    this.isLoading = true;
    
    this.adService.getAdById(id).subscribe({
      next: (ad: Ad) => {
        this.ad = ad;
        this.isLoading = false;
      },
      error: () => {
        this.alertService.pushAlert(AlertType.ERROR, this.translateService.instant("ADS.DETAIL_PAGE.ADS_ERROR"), 2);
        this.isLoading = false;
        this.router.navigate(['/ads']); // Redirection vers la liste en cas d'erreur
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/ads']);
  }
}