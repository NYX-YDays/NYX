import { Component, inject, OnInit, signal } from '@angular/core';
import { EventService } from '../../services/event.service';
import { UserEvent } from '../../models/user-event';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-individual-events',
  imports: [TranslatePipe, DatePipe, FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss'
})
export class EventListComponent implements OnInit {

  //region fields

  /** Listed events. */
  protected events = signal<UserEvent[]>([]);

  /** If the events are loading. */
  protected isLoading = signal(true);

  //endregion

  //region injections

  private eventService = inject(EventService);

  //endregion

  //region methods

  async ngOnInit() {
    this.events.set(await this.eventService.getUserEventsAsync());
    this.isLoading.set(false);
  }

  //endregion

}
