import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApproachService } from '../../services/approach.service';
import { Approach } from '../../models/approach';
import { DatePipe } from '@angular/common';
import { ApproachState } from '../../enums/approach-state';
import { RouterLink } from '@angular/router';
import { ApproachStateComponent } from '../approach-state/approach-state.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-see-approach-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    ApproachStateComponent,
    TranslatePipe
  ],
  templateUrl: './see-approach-modal.component.html',
  styleUrl: './see-approach-modal.component.scss'
})
export class SeeApproachModalComponent {

  //region parameters

  /** Notify when the state of the approach has been changed. $*/
  public onStateChanged = output();

  //endregion

  //region fields

  /** Approach to display information about. */
  protected approach = signal<Approach | undefined>(undefined);

  /** If the component is loading. */
  protected isLoading = signal(true);

  /** Modal opening button. */
  protected modalOpeningButton = viewChild<ElementRef>('modalOpeningButton');

  protected readonly ApproachState = ApproachState;

  //endregion

  //region injections

  private approachService = inject(ApproachService);

  private alertsService = inject(AlertService);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  /**
   * Open the modal to show information about an approach.
   * @param approachId ID of the approach to display information about.
   */
  public async openModalAsync(approachId: number) {
    this.isLoading.set(true);
    this.modalOpeningButton()?.nativeElement.click();
    this.approach.set(await this.approachService.getApproachAsync(approachId));
    this.isLoading.set(false);
  }

  /** Cancel the approach. */
  public async cancelApproachAsync() {
    this.alertsService.showConfirmation(
      async () => {
        this.isLoading.set(true);

        // Update approach state
        this.approach()!.state = ApproachState.CANCELLED;
        await this.approachService.updateApproachAsync(this.approach()!);

        this.alertsService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('APPROACH.SEE_MODAL.CANCEL_SUCCESS_MESSAGE'),
          7
        );

        // Refresh approach
        this.approach.set(await this.approachService.getApproachAsync(this.approach()!.id));
        this.onStateChanged.emit();
        this.approachService.onPendingApproachCountChanged.emit();

        this.isLoading.set(false);
      },
      this.translateService.instant('APPROACH.SEE_MODAL.CANCEL_CONFIRM_MESSAGE')
    );
  }

  //endregion

}
