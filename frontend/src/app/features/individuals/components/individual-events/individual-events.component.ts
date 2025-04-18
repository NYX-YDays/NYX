import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-individual-events',
  imports: [TranslatePipe, DatePipe, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './individual-events.component.html',
  styleUrl: './individual-events.component.scss'
})
export class IndividualEventsComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  eventForm: FormGroup;
  isEditing = false;
  currentEventId: number | null = null;
  
  constructor(
    private eventService: EventService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }
  
  async ngOnInit(): Promise<void> {
    await this.loadEvents();
  }
  
  async loadEvents(): Promise<void> {
    this.loading = true;
    try {
      this.events = await this.eventService.getUserEvents();
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.loading = false;
    }
  }
  
  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) {
      return;
    }
    
    try {
      if (this.isEditing && this.currentEventId) {
        await this.eventService.updateEvent(this.currentEventId, this.eventForm.value);
        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('EVENT.UPDATE_SUCCESS'),
          5
        );
      } else {
        await this.eventService.addEvent(this.eventForm.value);
        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('EVENT.ADD_SUCCESS'),
          5
        );
      }
      
      this.resetForm();
      await this.loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  }
  
  editEvent(event: Event): void {
    this.isEditing = true;
    this.currentEventId = event.id;
    this.eventForm.patchValue({
      title: event.title,
      description: event.description
    });
  }
  
  async deleteEvent(eventId: number): Promise<void> {
    if (confirm(this.translateService.instant('EVENT.CONFIRM_DELETE'))) {
      try {
        await this.eventService.deleteEvent(eventId);
        this.alertService.pushAlert(
          AlertType.SUCCESS,
          this.translateService.instant('EVENT.DELETE_SUCCESS'),
          5
        );
        await this.loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  }
  
  resetForm(): void {
    this.eventForm.reset();
    this.isEditing = false;
    this.currentEventId = null;
  }
}
