import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';
import { AdminApproachEditComponent } from '../admin-approach-edit/admin-approach-edit.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-approaches-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, FormsModule, AdminApproachEditComponent, AdminHeaderComponent],
  templateUrl: './admin-approaches-list.component.html',
  styleUrl: './admin-approaches-list.component.scss'
})
export class AdminApproachesListComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  public approaches: any[] = [];
  public filteredApproaches: any[] = [];
  public paginatedApproaches: any[] = [];
  public searchQuery = '';
  public isLoading = true;
  public approachToDelete: any = null;
  public approachBeingEdited: any = null;
  public showCreateModal = false;
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalPages = 1;

  async ngOnInit() {
    await this.loadApproaches();
  }

  private async loadApproaches(): Promise<void> {
    try {
      this.isLoading = true;
      this.approaches = await this.adminService.getAllApproaches();
      this.filteredApproaches = [...this.approaches];
      this.updatePagination();
    } catch (error) {
      console.error('Error loading approaches:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors du chargement des approches', 5);
    } finally {
      this.isLoading = false;
    }
  }

  public onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredApproaches = [...this.approaches];
    } else {
      this.filteredApproaches = this.approaches.filter(approach =>
        approach.ad?.title?.toLowerCase().includes(query) ||
        approach.event?.title?.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  public openCreateModal(): void {
    this.showCreateModal = true;
  }
  public closeCreateModal(): void {
    this.showCreateModal = false;
  }
  public onApproachCreated(newApproach: any): void {
    this.approaches.push(newApproach);
    this.onSearch();
    this.closeCreateModal();
  }
  public confirmDelete(approach: any): void {
    this.approachToDelete = approach;
  }
  public cancelDelete(): void {
    this.approachToDelete = null;
  }
  public async deleteApproach(): Promise<void> {
    if (!this.approachToDelete) return;
    try {
      await this.adminService.deleteApproach(this.approachToDelete.id);
      this.approaches = this.approaches.filter(a => a.id !== this.approachToDelete.id);
      this.filteredApproaches = this.filteredApproaches.filter(a => a.id !== this.approachToDelete.id);
      this.updatePagination();
      this.alertService.pushAlert(AlertType.SUCCESS, 'Approche supprimée avec succès', 5);
      this.approachToDelete = null;
    } catch (error: any) {
      console.error('Error deleting approach:', error);
      let message = 'Erreur lors de la suppression de l\'approche';
      if (error?.status === 409) {
        // Ajout du nom de l'annonce et de l'événement liés dans l'alerte
        const adTitle = this.approachToDelete?.ad?.title || 'Annonce inconnue';
        const eventTitle = this.approachToDelete?.event?.title || 'Événement inconnu';
        message = `Impossible de supprimer cette approche car elle est liée à l'annonce : <b>${adTitle}</b> et à l'événement : <b>${eventTitle}</b>.`;
      } else if (error?.error?.error) {
        message = error.error.error;
      }
      this.alertService.pushAlert(AlertType.ERROR, message, 7);
      this.approachToDelete = null;
    }
  }
  public goBack(): void {
    this.router.navigate(['/admin']);
  }
  public openEditModal(approach: any): void {
    this.approachBeingEdited = approach;
  }
  public closeEditModal(): void {
    this.approachBeingEdited = null;
  }
  public onApproachSaved(updatedApproach: any): void {
    const index = this.approaches.findIndex(a => a.id === updatedApproach.id);
    if (index !== -1) {
      this.approaches[index] = updatedApproach;
      this.onSearch();
    }
  }
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredApproaches.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedApproaches = this.filteredApproaches.slice(startIndex, endIndex);
  }
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  public previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }
  public nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);
      if (start > 2) {
        pages.push(-1);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < this.totalPages - 1) {
        pages.push(-1);
      }
      pages.push(this.totalPages);
    }
    return pages;
  }
  public changeItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.updatePagination();
  }
}
