import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { UserEvent } from '../../models/user-event';
import { DatePipe } from '@angular/common';
import { AlertService } from '../../../../shared/services/alert.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  SeeApproachModalComponent
} from '../../../approaches/components/see-approach-modal/see-approach-modal.component';
import { ApproachStateComponent } from '../../../approaches/components/approach-state/approach-state.component';
import { EventEditingFormComponent } from '../event-editing-form/event-editing-form.component';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';

@Component({
  selector: 'app-event-detail',
  imports: [
    RouterLink,
    DatePipe,
    TranslatePipe,
    SeeApproachModalComponent,
    ApproachStateComponent,
    EventEditingFormComponent
  ],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss'
})
export class EventDetailComponent implements OnInit {

  //region fields

  /** Event to display info from. */
  protected event = signal(new UserEvent());

  /** If the component is loading. */
  protected isLoading = signal(true);

  /** If the event editing form must be displayed. */
  protected showEditForm = signal(false);

  //endregion

  //region injections

  private activatedRoute = inject(ActivatedRoute);

  private eventService = inject(EventService);

  private alertService = inject(AlertService);

  private router = inject(Router);

  private translateService = inject(TranslateService);

  //endregion

  //region methods

  async ngOnInit() {
    this.showEditForm.set(false)
    this.isLoading.set(true);
    const eventId = (Number)(this.activatedRoute.snapshot.paramMap.get('id'));
    this.event.set(await this.eventService.getUserEventAsync(eventId));
    this.isLoading.set(false);
  }

  /** Delete current after confirmation. */
  protected async confirmEventDeletionAsync() {
    this.alertService.showConfirmation(
      async () => {
        await this.eventService.deleteEventAsync(this.event().id)
        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('EVENT.DETAIL_PAGE.DELETE_SUCCESS_MESSAGE'),
          7
        );
        await this.router.navigateByUrl(`/events`);
      },
      this.translateService.instant('EVENT.DETAIL_PAGE.DELETE_CONFIRM_MESSAGE')
    );
  }

  //endregion

}
