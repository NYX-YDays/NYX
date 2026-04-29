import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../events/services/event.service';
import { UserEvent } from '../../../events/models/user-event';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ad } from '../../../ads/models/ad';
import { ApproachService } from '../../services/approach.service';
import { Approach } from '../../models/approach';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

enum LoadingState {
  INITIALIZING, SENDING, READY
}

@Component({
  selector: 'app-add-approach-modal',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './add-approach-modal.component.html',
  styleUrl: './add-approach-modal.component.scss'
})
export class AddApproachModalComponent {

  //region fields

  /** Ad to create the approach from. */
  protected ad = signal<Ad | undefined>(undefined);

  /** Modal loading state. */
  protected loadingState = signal(LoadingState.INITIALIZING);

  /** Modal opening button. */
  protected modalOpeningButton = viewChild<ElementRef>('modalOpeningButton');

  /** Modal closing button. */
  protected modalClosingButton = viewChild<ElementRef>('modalClosingButton');

  /** Current user events. */
  protected userEvents = signal(new Array<UserEvent>());

  /** Approach between the add and one of the user events. */
  protected approach = signal(new Approach());

  protected readonly LoadingState = LoadingState;

  //endregion

  //region injections

  private eventService = inject(EventService);

  private approachService = inject(ApproachService);

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  /**
   * Open the modal.
   * @param ad Ad to create an approach from.
   */
  public async openModalAsync(ad: Ad) {
    this.loadingState.set(LoadingState.INITIALIZING);
    this.modalOpeningButton()?.nativeElement.click();

    this.ad.set(ad);
    this.userEvents.set(await this.eventService.getUserEventsNotLinkedToAdAsync(ad.id));
    this.approach.set({adId: ad.id} as Approach);

    this.loadingState.set(LoadingState.READY);
  }

  /** Add an approach from the selected event and ad. */
  protected async addApproachAsync() {
    this.loadingState.set(LoadingState.SENDING);

    try {
      await this.approachService.addApproachAsync(this.approach());
      this.closeModal();
      this.alertService.pushAlert(
        AlertType.SUCCESS,
        this.translateService.instant('APPROACH.ADD_MODAL.ADD_SUCCESS_TEXT'),
        7
      );
      this.approachService.onPendingApproachCountChanged.emit();
    }
    catch (e) {
      this.loadingState.set(LoadingState.READY);
    }
  }

  /** Close the modal. */
  protected closeModal() {
    this.modalClosingButton()?.nativeElement.click();
  }

  //endregion

}
