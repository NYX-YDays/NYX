import { Component, inject, OnInit, signal } from '@angular/core';
import { ApproachService } from '../../services/approach.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Approach } from '../../models/approach';
import { AlertService } from '../../../../shared/services/alert.service';
import { ApproachState } from '../../enums/approach-state';
import { ApproachStateComponent } from '../approach-state/approach-state.component';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';

@Component({
  selector: 'app-approach-list',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    ApproachStateComponent
  ],
  templateUrl: './approach-list.component.html',
  styleUrl: './approach-list.component.scss'
})
export class ApproachListComponent implements OnInit {

  //region fields

  /** If the component is loading. */
  protected isLoading = signal(true);

  /** Current user approaches. */
  protected approches = signal<Approach[]>([]);

  protected readonly ApproachState = ApproachState;

  //endregion

  //region injections

  private approachService = inject(ApproachService);

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  async ngOnInit() {
    this.approches.set(await this.approachService.getUserApproachesAsync());
    this.isLoading.set(false);
  }

  /**
   * Update the state of an approach.
   * @param approach Approach to update.
   * @param approachState New approach state.
   * @param confirmMessage If given, wait for a confirmation with the corresponding message to update the approach.
   */
  protected async updateApproachStateAsync(approach: Approach, approachState: ApproachState, confirmMessage = ''
  ) {
    const onConfirm = async () => {
      approach.state = approachState;
      await this.approachService.updateApproachAsync(approach);
      this.alertService.pushAlert(
        AlertType.SUCCESS,
        this.translateService.instant('APPROACH.LISTING_PAGE.APPROACH_STATE_CHANGE_SUCCESS_MESSAGE'),
        7
      );
      this.approachService.onPendingApproachCountChanged.emit();
    };

    if (confirmMessage != '') this.alertService.showConfirmation(onConfirm, confirmMessage);
    else await onConfirm();
  }

  /**
   * Mark an approach as accepted.
   * @param approach Approach to update.
   */
  protected async acceptApproachAsync(approach: Approach) {
    await this.updateApproachStateAsync(
      approach,
      ApproachState.APPROVED,
      this.translateService.instant('APPROACH.LISTING_PAGE.APPROVE_APPROACH_CONFIRM_MESSAGE')
    );
  }

  /**
   * Mark an approach as refused.
   * @param approach Approach to update.
   */
  protected async refuseApproachAsync(approach: Approach) {
    await this.updateApproachStateAsync(
      approach,
      ApproachState.REFUSED,
      this.translateService.instant('APPROACH.LISTING_PAGE.REFUSE_APPROACH_CONFIRM_MESSAGE')
    );
  }

  /**
   * Mark an approach as canceled.
   * @param approach Approach to update.
   */
  protected async cancelApproachAsync(approach: Approach) {
    await this.updateApproachStateAsync(
      approach,
      ApproachState.CANCELLED,
      this.translateService.instant('APPROACH.LISTING_PAGE.CANCEL_APPROACH_CONFIRM_MESSAGE')
    );
  }

  //endregion

}
