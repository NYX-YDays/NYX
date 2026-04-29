import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-confirm-modal',
  imports: [
    TranslatePipe
  ],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent implements OnInit {

  //region fields

  /** Confirmation message to show within the modal. */
  protected confirmationMessage = signal('');

  /** Modal opening button. */
  protected modalOpeningButton = viewChild<ElementRef>('modalOpeningButton');

  /** Modal closing button. */
  protected modalClosingButton = viewChild<ElementRef>('modalClosingButton');

  /** ID of the modal that was opened before opening this confirmation modal. */
  protected currentModalId = signal<string | undefined>(undefined);

  //endregion

  //region injections

  private readonly alertService = inject(AlertService);

  private readonly translationService = inject(TranslateService);

  //endregion

  //region methods

  /** Open the modal when a confirmation is pushed. */
  ngOnInit() {
    this.alertService.onConfirmationPushed.subscribe(confirmationMessage => {

      // Get the ID of the modal opened before this confirmation modal
      this.currentModalId.set(document.querySelector('.modal.show')?.id);

      // Set custom or default confirmation message
      this.confirmationMessage.set(
        confirmationMessage ?? this.translationService.instant('COMMON.CONFIRM_MODAL.MODAL_MESSAGE')
      );

      // Open modal
      this.modalOpeningButton()?.nativeElement.click();

    });
  }

  /** Acknowledge the confirmation. */
  protected confirm() {
    this.alertService.acknowledgeConfirmation();
    this.closeModal();
  }

  /** Close the modal. */
  protected closeModal() {
    this.modalClosingButton()?.nativeElement.click();
  }

  //endregion

}
