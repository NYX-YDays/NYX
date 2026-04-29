import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';

@Component({
  selector: 'app-admin-approach-edit',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './admin-approach-edit.component.html',
  styleUrl: './admin-approach-edit.component.scss'
})
export class AdminApproachEditComponent {
  @Input() approach: any;
  @Output() saved = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  public isSaving = false;

  public async save(): Promise<void> {
    if (!this.approach || !this.approach.id) {
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur : approche invalide', 5);
      return;
    }

    try {
      this.isSaving = true;
      const updated = await this.adminService.updateApproach(this.approach.id, {
        message: this.approach.message || '',
        state: parseInt(this.approach.state, 10) || 0
      });
      this.alertService.pushAlert(AlertType.SUCCESS, 'Approche mise à jour avec succès', 5);
      this.saved.emit(updated);
      this.closed.emit();
    } catch (error: any) {
      console.error('Error saving approach:', error);
      const errorMessage = error?.error?.error || error?.message || 'Erreur lors de la sauvegarde';
      this.alertService.pushAlert(AlertType.ERROR, errorMessage, 7);
    } finally {
      this.isSaving = false;
    }
  }

  public cancel(): void {
    this.closed.emit();
  }
}
