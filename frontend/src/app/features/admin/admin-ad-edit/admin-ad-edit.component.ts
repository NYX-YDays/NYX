import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';


@Component({
  selector: 'app-admin-ad-edit',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-ad-edit.component.html',
  styleUrl: './admin-ad-edit.component.scss'
})
export class AdminAdEditComponent implements OnInit {

  //region injections

  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region inputs/outputs

  @Input() set ad(value: any) {
    if (value) {
      this._ad = value;
      this.initForm();
    }
  }

  get ad(): any {
    return this._ad;
  }

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  //endregion

  //region fields

  private _ad: any = null;

  // Edit form
  public adForm!: FormGroup;

  // Saving state
  public isSaving = false;

  // Categories list
  public categories: any[] = [];

  // Price indication options
  public priceIndications = [
    { value: 'par heure', label: 'Par heure' },
    { value: 'par jour', label: 'Par jour' },
    { value: 'par semaine', label: 'Par semaine' },
    { value: 'par mois', label: 'Par mois' },
    { value: 'forfait', label: 'Forfait' },
    { value: 'sur devis', label: 'Sur devis' }
  ];

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadCategories();
  }

  // Load categories
  private async loadCategories(): Promise<void> {
    try {
      this.categories = await this.adminService.getAllCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  // Initialize the form
  private initForm(): void {
    this.adForm = this.fb.group({
      title: [this.ad.title || '', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: [this.ad.description || '', [Validators.required, Validators.maxLength(500)]],
      price: [this.ad.price || 0, [Validators.required, Validators.min(0)]],
      priceIndication: [this.ad.priceIndication || ''],
      isVerified: [this.ad.isVerified || false],
      datePublicationAd: [this.formatDateForInput(this.ad.datePublicationAd) || ''],
      categories: [this.ad.categories?.map((c: any) => c.id) || []]
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
    if (this.adForm.invalid) {
      this.adForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving = true;

      const adData = {
        ...this.adForm.value,
        price: parseFloat(this.adForm.value.price)
      };
      
      const updatedAd = await this.adminService.updateAd(this.ad.id, adData);
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Annonce mise à jour avec succès', 5);
      this.saved.emit(updatedAd);
      this.close();

    } catch (error: any) {
      console.error('Error updating ad:', error);
      const message = error?.error?.error || 'Erreur lors de la mise à jour de l\'annonce';
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
    const field = this.adForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Get error message for a field
  public getErrorMessage(fieldName: string): string {
    const field = this.adForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
    if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
    if (field.errors['min']) return 'La valeur doit être positive';

    return '';
  }

  // Check if category is selected
  public isCategorySelected(categoryId: number): boolean {
    const categories = this.adForm.get('categories')?.value || [];
    return categories.includes(categoryId);
  }

  // Toggle category
  public toggleCategory(categoryId: number): void {
    const categories = this.adForm.get('categories')?.value || [];
    const index = categories.indexOf(categoryId);
    
    if (index === -1) {
      categories.push(categoryId);
    } else {
      categories.splice(index, 1);
    }
    
    this.adForm.patchValue({ categories });
  }
}
