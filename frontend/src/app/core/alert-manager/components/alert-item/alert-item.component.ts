import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AlertType } from '../../enums/alert-type';
import { Alert } from '../../models/alert';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-alert-item',
  imports: [],
  templateUrl: './alert-item.component.html',
  styleUrl: './alert-item.component.scss'
})
export class AlertItemComponent implements OnInit {

  //region parameters

  /** Alert to display. **/
  @Input({required: true}) public alert!: Alert;

  /** Notify when the alert is dismissed. */
  @Output() public onDismiss = new EventEmitter;

  //endregion

  //region fields

  /** Alert close button. */
  @ViewChild('closeButton') private closeButton?: ElementRef;

  protected readonly AlertType = AlertType;
  protected readonly isNaN = isNaN;

  //endregion

  //region methods

  /** Start the alert countdown if it has a duration. */
  async ngOnInit() {
    if (!isNaN(this.alert.duration)) {
      this.alert.startCountdown();
      await firstValueFrom(this.alert.onCountdownOver);
      this.closeButton?.nativeElement.click();
    }
  }

  /** Dismiss the alert. */
  protected dismissAlert() {
    this.alert.stopCountdown();
    this.onDismiss.emit();
  }

  //endregion

}
