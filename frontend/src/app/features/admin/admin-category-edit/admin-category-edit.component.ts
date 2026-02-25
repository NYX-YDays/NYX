import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';

@Component({
  selector: 'app-admin-category-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-category-edit.component.html',
  styleUrl: './admin-category-edit.component.scss'
})
export class AdminCategoryEditComponent implements OnInit {

  //region Injections

  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region Inputs/Outputs

  @Input() category: any = null;
  @Input() isCreateMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  //endregion

  //region Fields

  public title = '';
  public isSaving = false;

  //endregion

  //region Methods

  ngOnInit(): void {
    if (this.category && !this.isCreateMode) {
      this.title = this.category.title || '';
    }
  }

  /** Close modal. */
  public onClose(): void {
    this.close.emit();
  }

  /** Save category (create or update). */
  public async onSave(): Promise<void> {
    // Validation
    if (!this.title.trim()) {
      this.alertService.pushAlert(AlertType.WARNING, 'Le titre est obligatoire', 5);
      return;
    }

    try {
      this.isSaving = true;

      const data = { title: this.title.trim() };

      if (this.isCreateMode) {
        // Create new category
        const newCategory = await this.adminService.createCategory(data);
        this.alertService.pushAlert(AlertType.SUCCESS, 'Catégorie créée avec succès', 5);
        this.saved.emit(newCategory);
      } else {
        // Update existing category
        const updatedCategory = await this.adminService.updateCategory(this.category.id, data);
        this.alertService.pushAlert(AlertType.SUCCESS, 'Catégorie modifiée avec succès', 5);
        this.saved.emit(updatedCategory);
      }

      this.onClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const message = error?.error?.error || `Erreur lors de la ${this.isCreateMode ? 'création' : 'modification'} de la catégorie`;
      this.alertService.pushAlert(AlertType.ERROR, message, 5);
    } finally {
      this.isSaving = false;
    }
  }

  //endregion

}
