import { Component, inject, OnInit } from '@angular/core';
import { IndividualService } from '../../services/individual.service';
import { Individual } from '../../models/individual';
import { File as UserFile } from '../../models/file';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Constants } from '../../../../shared/constants';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TranslateModule, TranslatePipe],
  templateUrl: './individual-profile.component.html',
  styleUrl: './individual-profile.component.scss'
})
export class IndividualProfileComponent implements OnInit {

  //region injections

  private readonly individualService = inject(IndividualService);
  private readonly router = inject(Router);

  //endregion

  //region fields

  /** Current individual data. */
  public individual: Individual | null = null;

  /** User roles. */
  public roles: string[] = [];

  /** Loading state. */
  public isLoading = true;

  /** Error state. */
  public hasError = false;

  /** Base URL for uploaded files. */
  private readonly uploadsBaseUrl = `${environment.apiUrl.replace('/api', '')}/uploads/`;

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadIndividualProfile();
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
      
      // Parse roles
      if (data.roles && Array.isArray(data.roles)) {
        this.roles = data.roles;
      }
      
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
      
    } catch (error) {
      console.error('Error loading individual profile:', error);
      this.hasError = true;
    } finally {
      this.isLoading = false;
    }
  }

  /** Navigate to edit profile page. */
  public navigateToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }

  /** Get formatted full name. */
  public getFullName(): string {
    if (!this.individual) return '';
    return `${this.individual.firstName} ${this.individual.lastName}`.trim();
  }

  /** Get formatted birthday date. */
  public getFormattedBirthday(): string {
    if (!this.individual?.birthdayDate) return 'Non renseignée';
    return this.individual.birthdayDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /** Get user initials for avatar. */
  public getInitials(): string {
    if (!this.individual) return '?';
    const firstInitial = this.individual.firstName?.charAt(0) || '';
    const lastInitial = this.individual.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  /** Get the banner image URL. */
  public getBannerUrl(): string | null {
    if (!this.individual?.files) return null;
    
    const bannerFile = this.individual.files.find(file => file.fileType === Constants.FILE_TYPE_BANNER);
    if (!bannerFile?.filePath) return null;
    
    // Construire l'URL complète
    return `${this.uploadsBaseUrl}${bannerFile.filePath}`;
  }

  /** Get the profile picture URL. */
  public getProfilePictureUrl(): string | null {
    if (!this.individual?.files) return null;
    
    const profilePicture = this.individual.files.find(file => file.fileType === Constants.FILE_TYPE_PROFILE_PICTURE);
    if (!profilePicture?.filePath) return null;
    
    // Construire l'URL complète
    return `${this.uploadsBaseUrl}${profilePicture.filePath}`;
  }

  /** Check if user has a banner. */
  public hasBanner(): boolean {
    return this.getBannerUrl() !== null;
  }

  /** Check if user has a profile picture. */
  public hasProfilePicture(): boolean {
    return this.getProfilePictureUrl() !== null;
  }

  /** Get translated role label. */
  public getRoleLabel(role: string): string {
    if (role === Constants.ROLE_INDIVIDUAL) return 'Particulier';
    if (role === Constants.ROLE_SERVICE_PROVIDER) return 'Professionnel';
    return role;
  }

  /** Check if user is individual. */
  public isIndividual(): boolean {
    return this.roles.includes(Constants.ROLE_INDIVIDUAL);
  }

  /** Check if user is service provider. */
  public isServiceProvider(): boolean {
    return this.roles.includes(Constants.ROLE_SERVICE_PROVIDER);
  }

  //endregion

}