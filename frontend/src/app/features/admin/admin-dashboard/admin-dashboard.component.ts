import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UtilService } from '../../../shared/services/util.service';
import { AdminService } from '../services/admin.service';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, AdminHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {

  //region injections

  private readonly router = inject(Router);
  private readonly utilService = inject(UtilService);
  private readonly adminService = inject(AdminService);

  //endregion

  //region fields

  /** Statistics data. */
  public stats = {
    userCount: 0,
    adCount: 0,
    eventCount: 0,
    categoryCount: 0
  };

  /** Current admin user */
  public currentUser =  this.utilService.getCurrentUserIdentity();

  /** Loading state. */
  public isLoading = true;

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadStatistics();
  }

  /** Load dashboard statistics. */
  private async loadStatistics(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Appeler la route API dédiée aux stats
      this.stats = await this.adminService.getStatistics();
      
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Valeurs par défaut en cas d'erreur
      this.stats = {
        userCount: 0,
        adCount: 0,
        eventCount: 0,
        categoryCount: 0
      };
    } finally {
      this.isLoading = false;
    }
  }

  /** Navigate to users management. */
  public navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  /** Navigate to ads management. */
  public navigateToAds(): void {
    this.router.navigate(['/admin/ads']);
  }

  /** Navigate to events management. */
  public navigateToEvents(): void {
    this.router.navigate(['/admin/events']);
  }

  /** Navigate to categories management. */
  public navigateToCategories(): void {
    this.router.navigate(['/admin/categories']);
  }

  //endregion

}