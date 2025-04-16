import { Component, inject, OnInit } from '@angular/core';
import { Alert } from '../../models/alert';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertItemComponent } from '../alert-item/alert-item.component';

@Component({
  selector: 'app-alert-stack',
  standalone: true,
  imports: [
    AlertItemComponent
  ],
  templateUrl: './alert-stack.component.html',
  styleUrl: './alert-stack.component.scss'
})
export class AlertStackComponent implements OnInit {

  //region fields

  /** The stack of the alerts to display. */
  protected alerts = new Array<Alert>();

  /** Index used to identify the stacked alerts. */
  private alertIndex = 1;

  //endregion

  //region injections

  private readonly alertService = inject(AlertService);

  //endregion

  //region methods

  /** Update the alert stack with incoming pushed alerts. */
  ngOnInit() {
    this.alertService.onAlertPushed.subscribe(
      alert => {

        // Set the alert ID
        this.alertIndex = this.alerts.length ? this.alertIndex + 1 : 1;
        alert.id = this.alertIndex;

        // Push the alert to the stack
        this.alerts.push(alert);
        this.alerts.sort((a, b) => b.id - a.id);

      }
    );
  }

  /**
   * Remove an alert from the alert stack.
   * @param alertId The ID of the alert to remove.
   */
  protected deleteAlert(alertId: number) {
    setTimeout(_ => {
      this.alerts.find(a => a.id == alertId)?.stopCountdown();
      this.alerts.splice(this.alerts.findIndex(a => a.id == alertId), 1);
    }, 1000);
  }

  //endregion

}
