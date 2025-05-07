import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {

  //region parameters

  /** Title of the modal. */
  @Input() public title!: string;

  /** Message to display within the modal. */
  @Input() public message!: string;

  /** Modal confirm button text. */
  @Input() public confirmButtonText!: string;

  /** Modal dismiss button text. */
  @Input() public dismissButtonText!: string;

  /** Notify if the confirmation was acknowledged. */
  @Output() public onConfirm = new EventEmitter();

  //endregion

  //region fields

  /** Modal opening button. */
  @ViewChild('modalOpeningButton') protected modalOpeningButton?: ElementRef;

  /** Modal closing button. */
  @ViewChild('modalClosingButton') protected modalClosingButton?: ElementRef;

  //endregion

  //region injections

  private readonly translationService = inject(TranslateService);

  //endregion

  //region methods

  /** Open the confirmation modal. */
  public openModal() {
    this.title ??= this.translationService.instant('COMMON.CONFIRM_MODAL.MODAL_TITLE');
    this.message ??= this.translationService.instant('COMMON.CONFIRM_MODAL.MODAL_MESSAGE');
    this.confirmButtonText ??= this.translationService.instant('COMMON.CONFIRM_MODAL.CONFIRM_BTN_TEXT');
    this.dismissButtonText ??= this.translationService.instant('COMMON.CONFIRM_MODAL.DISMISS_BTN_TEXT');
    this.modalOpeningButton?.nativeElement.click();
  }

  /** Acknowledge the modal confirmation. */
  public confirmModal() {
    this.onConfirm.emit();
    this.closeModal();
  }

  /** Close the confirmation modal. */
  public closeModal() {
    this.modalClosingButton?.nativeElement.click();
  }

  //endregion

}
