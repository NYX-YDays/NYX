import { AlertType } from '../enums/alert-type';
import { EventEmitter } from '@angular/core';

/** Alert used by the alert manager. */
export class Alert {

  //region fields

  /** The alert ID. */
  public id = NaN;

  /** The alert type. */
  public readonly type: AlertType;

  /** The message to display within the alert. */
  public readonly msg: string;

  /** The alert duration time in second. */
  public readonly duration: number;

  /** The alert countdown interval. */
  private interval: any;

  /** The alert countdown. */
  public countdown = NaN;

  /** Getting notified when the alert countdown is over. */
  public readonly onCountdownOver = new EventEmitter;

  /** If the alert countdown is over or not. */
  private isCountDownOver: boolean;

  //endregion

  //region constructor

  /**
   * Constructing a new alert.
   * @param type The alert type.
   * @param msg The message to display within the alert.
   * @param duration The alert duration time in second (permanent by default).
   */
  constructor(type: AlertType, msg: string, duration = NaN) {
    this.type = type;
    this.msg = msg;
    this.duration = duration;
    this.isCountDownOver = isNaN(this.duration);
  }

  //endregion

  //region methods

  /** Starting the alert countdown. */
  public startCountdown() {
    if (!this.isCountDownOver) {
      this.countdown = this.duration;
      this.interval = setInterval(
        () => {
          if (this.countdown > -0.2) this.countdown -= 0.1;
          else if (!this.isCountDownOver) this.onCountdownOver.emit();
        },
        100
      );
    }
  }

  /** Stopping the alert countdown. */
  public stopCountdown() {
    if (!this.isCountDownOver) {
      clearInterval(this.interval);
      this.isCountDownOver = true;
    }
  }

  //endregion

}
