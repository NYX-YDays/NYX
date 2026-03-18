import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserEvent } from '../../models/user-event';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';

@Component({
  selector: 'app-event-editing-form',
  imports: [
    TranslatePipe,
    FormsModule
  ],
  templateUrl: './event-editing-form.component.html',
  styleUrl: './event-editing-form.component.scss'
})
export class EventEditingFormComponent implements OnInit {

  //region parameters

  /** Existing event to edit. */
  public event = input<UserEvent>();

  /** Get a callback when the event edition is cancelled. */
  public onCancel = output();

  /** Get a callback when the event have been saved. */
  public onSave = output();

  //endregion

  //region fields

  /** Edited event copy. */
  protected editedEvent = signal<UserEvent | undefined>(undefined);

  /** If the event is being saved. */
  protected isSaving = signal(false);

  //endregion

  //region injections

  private eventService = inject(EventService);

  private router = inject(Router);

  private alertService = inject(AlertService);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  ngOnInit() {
    this.resetEvent();
  }

  /** Reset edited event. */
  protected resetEvent() {

    // Set the form to edit the given existing event
    if (this.event()) this.editedEvent.set(structuredClone(this.event()));

    // Else set the form to edit a new event
    else this.editedEvent.set(new UserEvent());

  }

  /** Save edited event. */
  protected async saveEventAsync() {
    this.isSaving.set(true);

    try {

      // Update existing event
      if (this.event()) await this.eventService.updateEventAsync(this.editedEvent()!);

      // Add new event
      else {
        const eventId = (await this.eventService.addEventAsync(this.editedEvent()!)).id;
        await this.router.navigateByUrl(`/event/${eventId}`);
      }

      this.alertService.pushAlert(
        AlertType.SUCCESS,
        this.translateService.instant('EVENT.EDIT_FORM.SAVE_SUCCESS_MESSAGE'),
        7
      );

      this.onSave.emit();

    } catch (e) {
    }

    this.isSaving.set(false);
  }

  /** Cancel event edition. */
  protected cancelEdition() {
    this.resetEvent();
    this.onCancel.emit();
  }

  //endregion

}
