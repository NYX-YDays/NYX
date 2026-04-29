import { EventEmitter, Injectable } from '@angular/core';
import { Alert } from '../../core/alert-manager/models/alert';
import { AlertType } from '../../core/alert-manager/enums/alert-type';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  //region fields

  /** Getting notified when an alert has been pushed. */
  public readonly onAlertPushed = new EventEmitter<Alert>;

  /** Getting notified when a confirmation has been pushed. */
  public readonly onConfirmationPushed = new EventEmitter<string>;

  /** Function to execute when the latest confirmation has been acknowledged. */
  private onConfirm!: Function;

  //endregion

  //region methods

  /**
   * Pushing an alert into the displayed alert stack.
   * @param type The type of the alert to push.
   * @param msg The message of the alert.
   * @param duration The alert duration time in second (permanent by default).
   */
  public pushAlert(type: AlertType, msg: string, duration = NaN) {
    this.onAlertPushed.emit(new Alert(type, msg, duration));
  }

  /**
   * Show a confirmation modal.
   * @param onConfirm Function to execute on confirmation.
   * @param confirmationMessage Confirmation message to display.
   */
  public showConfirmation(onConfirm: Function, confirmationMessage?: string) {
    this.onConfirm = onConfirm;
    this.onConfirmationPushed.emit(confirmationMessage);
  }

  /** Acknowledge the latest confirmation pushed and execute the callback method. */
  public acknowledgeConfirmation() {
    this.onConfirm();
  }

  //endregion

}
