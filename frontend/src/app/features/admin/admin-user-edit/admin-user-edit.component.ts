import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';
import { Constants } from '../../../shared/constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-user-edit',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-user-edit.component.html',
  styleUrl: './admin-user-edit.component.scss'
})
export class AdminUserEditComponent {

  //region injections

  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region inputs/outputs

  @Input() set user(value: any) {
    if (value) {
      this._user = value;
      this.initForm();
    }
  }

  get user(): any {
    return this._user;
  }

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  //endregion

  //region fields

  private _user: any = null;

  // Edit form
  public userForm!: FormGroup;

  // Saving state
  public isSaving = false;

  //endregion

  //region methods

  // Initialize the form
  private initForm(): void {
    this.userForm = this.fb.group({
      firstName: [this.user.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.user.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user.email || '', [Validators.required, Validators.email]],
      phone: [this.user.phone || '', [Validators.pattern(Constants.PHONE_REGEX)]],
      address: [this.user.address || ''],
      sex: [this.user.sex || ''],
      bio: [this.user.bio || '', [Validators.maxLength(500)]],
      birthdayDate: [this.formatDateForInput(this.user.birthdayDate) || '']
    });
  }

  // Format date for input
  private formatDateForInput(date: any): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  // Save changes
  public async save(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving = true;

      const userData = this.userForm.value; 
      const updatedUser = await this.adminService.updateUser(this.user.id, userData);
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Utilisateur mis à jour avec succès', 5);
      this.saved.emit(updatedUser);
      this.close();

    } catch (error: any) {
      console.error('Error updating user:', error);
      const message = error?.error?.error || 'Erreur lors de la mise à jour de l\'utilisateur';
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
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Get error message for a field
  public getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    if (field.errors['email']) return 'Email invalide';
    if (field.errors['pattern']) return 'Format invalide (ex: 0612345678)';

    return '';
  }
}
