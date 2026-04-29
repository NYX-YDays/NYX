import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';


@Component({
  selector: 'app-admin-event-edit',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-event-edit.component.html',
  styleUrl: './admin-event-edit.component.scss'
})
export class AdminEventEditComponent {

  //region injections

  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region inputs/outputs

  @Input() set event(value: any) {
    if (value) {
      this._event = value;
      this.initForm();
    }
  }

  get event(): any {
    return this._event;
  }

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  //endregion

  //region fields

  private _event: any = null;

  // Edit form
  public eventForm!: FormGroup;

  // Saving state
  public isSaving = false;

  //endregion

  //region methods

  // Initialize the form
  private initForm(): void {
    this.eventForm = this.fb.group({
      title: [this.event.title || '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: [this.event.description || '', [Validators.required, Validators.maxLength(500)]],
      dateEvent: [this.formatDateTimeForInput(this.event.dateEvent) || '', [Validators.required]]
    });
  }

  // Format date for datetime-local input
  private formatDateTimeForInput(date: any): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      // Format: YYYY-MM-DDTHH:mm
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  }

  // Save changes
  public async save(): Promise<void> {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving = true;

      const eventData = {
        ...this.eventForm.value
      };
      
      const updatedEvent = await this.adminService.updateEvent(this.event.id, eventData);
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Événement mis à jour avec succès', 5);
      this.saved.emit(updatedEvent);
      this.close();

    } catch (error: any) {
      console.error('Error updating event:', error);
      const message = error?.error?.error || 'Erreur lors de la mise à jour de l\'événement';
      this.alertService.pushAlert(AlertType.ERROR, message, 5);
    } finally {
      this.isSaving = false;
    }
  }

  // Close modal
  public close(): void {
    this.closed.emit();
  }

  // Check if form field has error
  public hasError(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Get error message for a field
  public getErrorMessage(fieldName: string): string {
    const field = this.eventForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;

    return '';
  }
}
