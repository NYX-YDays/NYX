import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';
import { AdminCategoryEditComponent } from '../admin-category-edit/admin-category-edit.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-categories-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, FormsModule, AdminCategoryEditComponent, AdminHeaderComponent],
  templateUrl: './admin-categories-list.component.html',
  styleUrl: './admin-categories-list.component.scss'
})
export class AdminCategoriesListComponent implements OnInit {

  //region injections

  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region fields

  /** List of all categories. */
  public categories: any[] = [];

  /** Filtered categories (for search). */
  public filteredCategories: any[] = [];

  /** Paginated categories (current page) */
  public paginatedCategories: any[] = [];

  /** Search query. */
  public searchQuery = '';

  /** Loading state. */
  public isLoading = true;

  /** Category to delete (for confirmation modal). */
  public categoryToDelete: any = null;

  /** Category being edited. */
  public categoryBeingEdited: any = null;

  /** Show create modal. */
  public showCreateModal = false;

  /** Pagination */
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalPages = 1;

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadCategories();
  }

  /** Load all categories. */
  private async loadCategories(): Promise<void> {
    try {
      this.isLoading = true;
      this.categories = await this.adminService.getAdminCategories();
      this.filteredCategories = [...this.categories];
      this.updatePagination();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors du chargement des catégories', 5);
    } finally {
      this.isLoading = false;
    }
  }

  /** Filter categories based on search query. */
  public onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category => 
        category.title?.toLowerCase().includes(query)
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  /** Open create modal. */
  public openCreateModal(): void {
    this.showCreateModal = true;
  }

  /** Close create modal. */
  public closeCreateModal(): void {
    this.showCreateModal = false;
  }

  /** Handle category created. */
  public onCategoryCreated(newCategory: any): void {
    this.categories.push(newCategory);
    this.onSearch();
    this.closeCreateModal();
  }

  /** Open delete confirmation modal. */
  public confirmDelete(category: any): void {
    this.categoryToDelete = category;
  }

  /** Cancel delete. */
  public cancelDelete(): void {
    this.categoryToDelete = null;
  }

  /** Delete category. */
  public async deleteCategory(): Promise<void> {
    if (!this.categoryToDelete) return;

    try {
      await this.adminService.deleteCategory(this.categoryToDelete.id);
      
      // Retirer de la liste
      this.categories = this.categories.filter(c => c.id !== this.categoryToDelete.id);
      this.filteredCategories = this.filteredCategories.filter(c => c.id !== this.categoryToDelete.id);
      this.updatePagination();
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Catégorie supprimée avec succès', 5);
      this.categoryToDelete = null;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      let message = 'Erreur lors de la suppression de la catégorie';
      if (error?.status === 409) {
        message = error?.error?.error || 'Impossible de supprimer cette catégorie.';
      } else if (error?.error?.error) {
        message = error.error.error;
      }
      
      this.alertService.pushAlert(AlertType.ERROR, message, 7);
      this.categoryToDelete = null;
    }
  }

  /** Navigate back to dashboard. */
  public goBack(): void {
    this.router.navigate(['/admin']);
  }

  /** Open edit modal. */
  public openEditModal(category: any): void {
    this.categoryBeingEdited = category;
  }

  /** Close edit modal. */
  public closeEditModal(): void {
    this.categoryBeingEdited = null;
  }

  /** Handle category saved. */
  public onCategorySaved(updatedCategory: any): void {
    // Mettre à jour dans la liste
    const index = this.categories.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
      this.categories[index] = updatedCategory;
      this.onSearch();
    }
  }

  /** Calculate pagination. */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
    
    // Reset to page 1 if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Calculate start and end indices
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Get paginated categories
    this.paginatedCategories = this.filteredCategories.slice(startIndex, endIndex);
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
        pages.push(-1);
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

  //endregion

}
