import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';
import { AdminEventEditComponent } from '../admin-event-edit/admin-event-edit.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-events-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, FormsModule, AdminEventEditComponent, AdminHeaderComponent],
  templateUrl: './admin-events-list.component.html',
  styleUrl: './admin-events-list.component.scss'
})
export class AdminEventsListComponent implements OnInit {

  //region injections

  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region fields

  /** List of all events. */
  public events: any[] = [];

  /** Filtered events (for search). */
  public filteredEvents: any[] = [];

  /** Paginated events (current page) */
  public paginatedEvents: any[] = [];

  /** Search query. */
  public searchQuery = '';

  /** Loading state. */
  public isLoading = true;

  /** Event to delete (for confirmation modal). */
  public eventToDelete: any = null;

  /** Event being edited. */
  public eventBeingEdited: any = null;

  /** Pagination */
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalPages = 1;

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadEvents();
  }

  /** Load all events. */
  private async loadEvents(): Promise<void> {
    try {
      this.isLoading = true;
      this.events = await this.adminService.getAllEvents();
      this.filteredEvents = [...this.events];
      this.updatePagination();
    } catch (error) {
      console.error('Error loading events:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors du chargement des événements', 5);
    } finally {
      this.isLoading = false;
    }
  }

  /** Filter events based on search query. */
  public onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.user?.firstName?.toLowerCase().includes(query) ||
        event.user?.lastName?.toLowerCase().includes(query) ||
        event.user?.email?.toLowerCase().includes(query)
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  /** Open delete confirmation modal. */
  public confirmDelete(event: any): void {
    this.eventToDelete = event;
  }

  /** Cancel delete. */
  public cancelDelete(): void {
    this.eventToDelete = null;
  }

  /** Delete event. */
  public async deleteEvent(): Promise<void> {
    if (!this.eventToDelete) return;

    try {
      await this.adminService.deleteEvent(this.eventToDelete.id);
      
      // Retirer de la liste
      this.events = this.events.filter(e => e.id !== this.eventToDelete.id);
      this.filteredEvents = this.filteredEvents.filter(e => e.id !== this.eventToDelete.id);
      this.updatePagination();
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Événement supprimé avec succès', 5);
      this.eventToDelete = null;
    } catch (error: any) {
      console.error('Error deleting event:', error);
      let message = 'Erreur lors de la suppression de l\'événement';
      if (error?.status === 409) {
        message = error?.error?.error || 'Impossible de supprimer cet événement.';
      } else if (error?.error?.error) {
        message = error.error.error;
      }
      
      this.alertService.pushAlert(AlertType.ERROR, message, 7);
      this.eventToDelete = null;
    }
  }

  /** Navigate back to dashboard. */
  public goBack(): void {
    this.router.navigate(['/admin']);
  }

  /** Open edit modal. */
  public openEditModal(event: any): void {
    this.eventBeingEdited = event;
  }

  /** Close edit modal. */
  public closeEditModal(): void {
    this.eventBeingEdited = null;
  }

  /** Handle event saved. */
  public onEventSaved(updatedEvent: any): void {
    // Mettre à jour dans la liste
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = updatedEvent;
      this.onSearch(); // Rafraîchir les résultats filtrés
    }
  }

  /** Calculate pagination. */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    
    // Reset to page 1 if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Calculate start and end indices
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Get paginated events
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
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

  /** Get approaches count. */
  public getApproachesCount(event: any): number {
    return event.approaches?.length || 0;
  }

  //endregion

}
