import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Ad } from '../../models/ad';
import { AdService } from '../../services/ad.services';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { Category } from '../../models/category';

@Component({
  selector: 'app-ad-editing-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './ad-editing-form.component.html',
  styleUrl: './ad-editing-form.component.scss'
})
export class AdEditingFormComponent {

  //region parameters

  /** Existing ad to edit. */
  public ad = input<Ad>();

  /** Get a callback when the ad edition is canceled. */
  public onCancel = output();

  /** Get a callback when the ad have been saved. */
  public onSave = output();

  //endregion

  //region fields

  /** Edited ad copy. */
  protected editedAd = signal<Ad | undefined>(undefined);

  /** Available ad categories. */
  protected adCategories = signal(new Array<Category>());

  /** If the ad is being saved. */
  protected isSaving = signal(false);

  /** If the component is loading. */
  protected isLoading = signal(true);

  //endregion

  //region injections

  private adService = inject(AdService);

  private router = inject(Router);

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  async ngOnInit() {
    this.adCategories.set(await this.adService.getAllCategoriesAsync());
    this.resetAd();
    this.isLoading.set(false);
  }

  /** Reset edited event. */
  protected resetAd() {

    // Set the form to edit the given existing ad
    if (this.ad()) this.editedAd.set(structuredClone(this.ad()));

    // Else set the form to edit a new ad
    else this.editedAd.set(new Ad());

  }

  protected toggleCategory(category: Category) {
    const i = this.editedAd()!.categories.findIndex(x => x.id == category.id);
    if (i > -1) this.editedAd()!.categories.splice(i, 1);
    else this.editedAd()!.categories.push(category);
  }

  /** Save edited add. */
  protected async saveAdAsync() {
    this.alertService.showConfirmation(
      async () => {
        this.isSaving.set(true);

        // Update existing ad
        if (this.ad()) await this.adService.updateAdAsync(this.editedAd()!);

        // Add new ad
        else {
          const adId = (await this.adService.addAdAsync(this.editedAd()!)).id;
          await this.router.navigateByUrl(`/my-ads/${adId}`);
        }

        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('ADS.EDITING_FORM.SAVE_SUCCESS_MESSAGE'),
          7
        );
        this.onSave.emit();

        this.isSaving.set(false);
      },
      this.translateService.instant('ADS.EDITING_FORM.SAVE_CONFIRM_MESSAGE')
    );
  }

  /** Cancel event edition. */
  protected cancelEdition() {
    this.resetAd();
    this.onCancel.emit();
  }

  //endregion

}
