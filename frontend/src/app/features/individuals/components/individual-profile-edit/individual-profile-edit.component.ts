import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IndividualService } from '../../services/individual.service';
import { FileService } from '../../services/file.service';
import { Individual } from '../../models/individual';
import { File as UserFile } from '../../models/file';
import { TranslateModule } from '@ngx-translate/core';
import { Constants } from '../../../../shared/constants';
import { environment } from '../../../../../environments/environment';
import { AlertService } from '../../../../shared/services/alert.service';
import { AlertType } from '../../../../core/alert-manager/enums/alert-type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-individual-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './individual-profile-edit.component.html',
  styleUrl: './individual-profile-edit.component.scss'
})
export class IndividualProfileEditComponent implements OnInit {

  //region injections

  private readonly fb = inject(FormBuilder);
  private readonly individualService = inject(IndividualService);
  private readonly fileService = inject(FileService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);

  //endregion

  //region fields

  /** Profile form. */
  public profileForm!: FormGroup;

  /** Current individual data. */
  public individual: Individual | null = null;

  /** Loading state. */
  public isLoading = true;

  /** Saving state. */
  public isSaving = false;

  /** Error state. */
  public hasError = false;

  /** Profile picture file. */
  public profilePictureFile: File | null = null;

  /** Profile picture preview URL. */
  public profilePicturePreview: string | null = null;

  /** Banner file. */
  public bannerFile: File | null = null;

  /** Banner preview URL. */
  public bannerPreview: string | null = null;

  /** Max file sizes. */
  public readonly maxProfilePictureSize = Constants.MAX_PROFILE_PICTURE_SIZE;
  public readonly maxBannerSize = Constants.MAX_BANNER_SIZE;

  /** Base URL for uploaded files. */
  private readonly uploadsBaseUrl = `${environment.apiUrl.replace('/api', '')}/uploads/`;

  //endregion

  //region methods

  async ngOnInit() {
    this.initForm();
    await this.loadIndividualProfile();
  }

  /** Initialize the form. */
  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      birthdayDate: [''],
      address: [''],
      sex: [''],
      bio: ['', [Validators.maxLength(500)]],
      phone: ['', [Validators.pattern(/^0[1-9][0-9]{8}$/)]],
      isServiceProvider: [false]
    });
  }

  /** Load the current individual's profile. */
  private async loadIndividualProfile(): Promise<void> {
    try {
      this.isLoading = true;
      this.hasError = false;
      
      const data = await this.individualService.getCurrentIndividual();
      
      this.individual = new Individual();
      this.individual.id = data.id;
      this.individual.firstName = data.firstName || '';
      this.individual.lastName = data.lastName || '';
      this.individual.email = data.email || '';
      this.individual.address = data.address || '';
      this.individual.sex = data.sex || '';
      this.individual.bio = data.bio || '';
      this.individual.phone = data.phone || '';
      
      // Parse files
      if (data.files && Array.isArray(data.files)) {
        this.individual.files = data.files.map((fileData: any) => {
          const file = new UserFile();
          file.id = fileData.id;
          file.fileName = fileData.fileName || '';
          file.filePath = fileData.filePath || '';
          file.fileType = fileData.fileType || '';
          return file;
        });
      }
      
      // Parse birthday date if exists
      if (data.birthdayDate) {
        this.individual.birthdayDate = new Date(data.birthdayDate);
      }

      // Check if user is service provider
      const isServiceProvider = data.roles && data.roles.includes(Constants.ROLE_SERVICE_PROVIDER);
      
      // Populate form
      this.profileForm.patchValue({
        firstName: this.individual.firstName,
        lastName: this.individual.lastName,
        email: this.individual.email,
        birthdayDate: this.formatDateForInput(this.individual.birthdayDate),
        address: this.individual.address,
        sex: this.individual.sex,
        bio: this.individual.bio,
        phone: this.individual.phone,
        isServiceProvider: isServiceProvider
      });

      // Set current images
      this.profilePicturePreview = this.getProfilePictureUrl();
      this.bannerPreview = this.getBannerUrl();
      
    } catch (error) {
      console.error('Error loading individual profile:', error);
      this.hasError = true;
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors du chargement du profil', 5);
    } finally {
      this.isLoading = false;
    }
  }

  /** Format date for input field (YYYY-MM-DD). */
  private formatDateForInput(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Handle profile picture selection. */
  public onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!Constants.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        this.alertService.pushAlert(AlertType.ERROR, 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.', 5);
        return;
      }
      
      // Validate file size
      if (file.size > this.maxProfilePictureSize) {
        this.alertService.pushAlert(AlertType.ERROR, 'La photo de profil ne doit pas dépasser 2MB.', 5);
        return;
      }
      
      this.profilePictureFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /** Handle banner selection. */
  public onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!Constants.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        this.alertService.pushAlert(AlertType.ERROR, 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.', 5);
        return;
      }
      
      // Validate file size
      if (file.size > this.maxBannerSize) {
        this.alertService.pushAlert(AlertType.ERROR, 'La bannière ne doit pas dépasser 5MB.', 5);
        return;
      }
      
      this.bannerFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bannerPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /** Submit the form. */
  public async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.individual) {
      this.profileForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving = true;

      const formValue = this.profileForm.value;

      // Prepare roles
      const roles = [Constants.ROLE_INDIVIDUAL];
      if (formValue.isServiceProvider) {
        roles.push(Constants.ROLE_SERVICE_PROVIDER);
      }

      // Prepare data for update
      const updateData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        birthdayDate: formValue.birthdayDate || null,
        address: formValue.address,
        sex: formValue.sex,
        bio: formValue.bio,
        phone: formValue.phone,
        roles: roles
      };

      // Update profile
      await this.individualService.updateIndividual(this.individual.id, updateData);

      // Upload profile picture if selected
      if (this.profilePictureFile) {
        const existingProfilePicture = this.individual.files.find(f => f.fileType === Constants.FILE_TYPE_PROFILE_PICTURE);
        
        if (existingProfilePicture && existingProfilePicture.id && !isNaN(existingProfilePicture.id)) {
          await this.fileService.updateFile(existingProfilePicture.id, this.profilePictureFile);
        } else {
          await this.fileService.uploadFile(this.profilePictureFile, Constants.FILE_TYPE_PROFILE_PICTURE);
        }
      }

      // Upload banner if selected
      if (this.bannerFile) {
        const existingBanner = this.individual.files.find(f => f.fileType === Constants.FILE_TYPE_BANNER);
        
        if (existingBanner && existingBanner.id && !isNaN(existingBanner.id)) {
          await this.fileService.updateFile(existingBanner.id, this.bannerFile);
        } else {
          await this.fileService.uploadFile(this.bannerFile, Constants.FILE_TYPE_BANNER);
        }
      }

      // Success message
      this.alertService.pushAlert(AlertType.SUCCESS, 'Profil mis à jour avec succès !', 5);

      // Navigate back to profile
      this.router.navigate(['/profile']);

    } catch (error) {
      console.error('Error updating profile:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors de la mise à jour du profil', 5);
    } finally {
      this.isSaving = false;
    }
  }

  /** Cancel and go back to profile. */
  public onCancel(): void {
    this.router.navigate(['/profile']);
  }

  /** Get the profile picture URL. */
  private getProfilePictureUrl(): string | null {
    if (!this.individual?.files) return null;
    
    const profilePicture = this.individual.files.find(file => file.fileType === Constants.FILE_TYPE_PROFILE_PICTURE);
    if (!profilePicture?.filePath) return null;
    
    return `${this.uploadsBaseUrl}${profilePicture.filePath}`;
  }

  /** Get the banner URL. */
  private getBannerUrl(): string | null {
    if (!this.individual?.files) return null;
    
    const bannerFile = this.individual.files.find(file => file.fileType === Constants.FILE_TYPE_BANNER);
    if (!bannerFile?.filePath) return null;
    
    return `${this.uploadsBaseUrl}${bannerFile.filePath}`;
  }

  /** Get user initials for avatar. */
  public getInitials(): string {
    if (!this.individual) return '?';
    const firstInitial = this.individual.firstName?.charAt(0) || '';
    const lastInitial = this.individual.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  /** Check if a form field has errors. */
  public hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /** Get error message for a field. */
  public getFieldErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) return 'Ce champ est requis';
    if (field.hasError('email')) return 'Email invalide';
    if (field.hasError('minlength')) return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    if (field.hasError('maxlength')) return `Maximum ${field.errors?.['maxlength'].requiredLength} caractères`;
    if (field.hasError('pattern')) return 'Format invalide (ex: 0612345678)';

    return '';
  }

  //endregion

}