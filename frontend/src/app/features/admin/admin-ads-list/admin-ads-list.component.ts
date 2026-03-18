import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';
import { AdminAdEditComponent } from '../admin-ad-edit/admin-ad-edit.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-ads-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, FormsModule, AdminAdEditComponent, AdminHeaderComponent],
  templateUrl: './admin-ads-list.component.html',
  styleUrl: './admin-ads-list.component.scss'
})
export class AdminAdsListComponent implements OnInit {

  //region injections

  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region fields

  /** List of all ads. */
  public ads: any[] = [];

  /** Filtered ads (for search). */
  public filteredAds: any[] = [];

  /** Paginated ads (current page) */
  public paginatedAds: any[] = [];

  /** Search query. */
  public searchQuery = '';

  /** Loading state. */
  public isLoading = true;

  /** Ad to delete (for confirmation modal). */
  public adToDelete: any = null;

  /** Ad being edited. */
  public adBeingEdited: any = null;

  /** Pagination */
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalPages = 1;

  /** Filter by verification status */
  public verificationFilter: 'all' | 'verified' | 'unverified' = 'all';

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadAds();
  }

  /** Load all ads. */
  private async loadAds(): Promise<void> {
    try {
      this.isLoading = true;
      this.ads = await this.adminService.getAllAds();
      this.filteredAds = [...this.ads];
      this.updatePagination();
    } catch (error) {
      console.error('Error loading ads:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors du chargement des annonces', 5);
    } finally {
      this.isLoading = false;
    }
  }

  /** Filter ads based on search query and verification status. */
  public onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    let filtered = [...this.ads];

    // Filter by verification status
    if (this.verificationFilter === 'verified') {
      filtered = filtered.filter(ad => ad.isVerified === true);
    } else if (this.verificationFilter === 'unverified') {
      filtered = filtered.filter(ad => ad.isVerified === false);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(ad => 
        ad.title?.toLowerCase().includes(query) ||
        ad.description?.toLowerCase().includes(query) ||
        ad.user?.firstName?.toLowerCase().includes(query) ||
        ad.user?.lastName?.toLowerCase().includes(query) ||
        ad.user?.email?.toLowerCase().includes(query)
      );
    }

    this.filteredAds = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Open delete confirmation modal. */
  public confirmDelete(ad: any): void {
    this.adToDelete = ad;
  }

  /** Cancel delete. */
  public cancelDelete(): void {
    this.adToDelete = null;
  }

  /** Delete ad. */
  public async deleteAd(): Promise<void> {
    if (!this.adToDelete) return;

    try {
      await this.adminService.deleteAd(this.adToDelete.id);
      
      // Retirer de la liste
      this.ads = this.ads.filter(a => a.id !== this.adToDelete.id);
      this.filteredAds = this.filteredAds.filter(a => a.id !== this.adToDelete.id);
      this.updatePagination();
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Annonce supprimée avec succès', 5);
      this.adToDelete = null;
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      let message = 'Erreur lors de la suppression de l\'annonce';
      if (error?.status === 409) {
        message = error?.error?.error || 'Impossible de supprimer cette annonce.';
      } else if (error?.error?.error) {
        message = error.error.error;
      }
      
      this.alertService.pushAlert(AlertType.ERROR, message, 7);
      this.adToDelete = null;
    }
  }

  /** Toggle verification status. */
  public async toggleVerification(ad: any): Promise<void> {
    try {
      const newStatus = !ad.isVerified;
      await this.adminService.toggleAdVerification(ad.id, newStatus);
      
      // Mettre à jour localement
      ad.isVerified = newStatus;
      
      const message = newStatus ? 'Annonce vérifiée avec succès' : 'Annonce marquée comme non vérifiée';
      this.alertService.pushAlert(AlertType.SUCCESS, message, 5);
    } catch (error) {
      console.error('Error toggling verification:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors de la mise à jour du statut', 5);
    }
  }

  /** Get verification badge class. */
  public getVerificationBadgeClass(isVerified: boolean): string {
    return isVerified ? 'bg-success' : 'bg-warning text-dark';
  }

  /** Get verification label. */
  public getVerificationLabel(isVerified: boolean): string {
    return isVerified ? 'Vérifiée' : 'Non vérifiée';
  }

  /** Navigate back to dashboard. */
  public goBack(): void {
    this.router.navigate(['/admin']);
  }

  /** Open edit modal. */
  public openEditModal(ad: any): void {
    this.adBeingEdited = ad;
  }

  /** Close edit modal. */
  public closeEditModal(): void {
    this.adBeingEdited = null;
  }

  /** Handle ad saved. */
  public onAdSaved(updatedAd: any): void {
    // Mettre à jour dans la liste
    const index = this.ads.findIndex(a => a.id === updatedAd.id);
    if (index !== -1) {
      this.ads[index] = updatedAd;
      this.onSearch(); // Rafraîchir les résultats filtrés
    }
  }

  /** Calculate pagination. */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAds.length / this.itemsPerPage);
    
    // Reset to page 1 if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Calculate start and end indices
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Get paginated ads
    this.paginatedAds = this.filteredAds.slice(startIndex, endIndex);
  }

  /** Go to specific page. */
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /** Go to previous page. */
  public previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  /** Go to next page. */
  public nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  /** Get array of page numbers for pagination UI. */
  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < this.totalPages - 1) {
        pages.push(-1);
      }
      
      // Always show last page
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  /** Change items per page. */
  public changeItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.updatePagination();
  }

  /** Format price with currency. */
  public formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  //endregion

}
