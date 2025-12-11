import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../services/admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AlertType } from '../../../core/alert-manager/enums/alert-type';
import { AdminUserEditComponent } from '../admin-user-edit/admin-user-edit.component';
import { AdminHeaderComponent } from '../shared/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, FormsModule, AdminUserEditComponent, AdminHeaderComponent],
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.scss'
})
export class AdminUsersListComponent implements OnInit {

  //region injections

  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly alertService = inject(AlertService);

  //endregion

  //region fields

  /** List of all users. */
  public users: any[] = [];

  /** Filtered users (for search). */
  public filteredUsers: any[] = [];

  /** Paginated users (current page) */
  public paginatedUsers: any[] = [];

  /** Search query. */
  public searchQuery = '';

  /** Loading state. */
  public isLoading = true;

  /** User to delete (for confirmation modal). */
  public userToDelete: any = null;

  /** Selected user for role editing. */
  public selectedUser: any = null;

  /** Temporary roles for editing. */
  public tempRoles: string[] = [];

  /** User being edited. */
  public userBeingEdited: any = null;

  /** Pagination */
  public currentPage = 1;
  public itemsPerPage = 10;
  public totalPages = 1;

  //endregion

  //region methods

  async ngOnInit() {
    await this.loadUsers();
  }

  /** Load all users. */
  private async loadUsers(): Promise<void> {
    try {
      this.isLoading = true;
      this.users = await this.adminService.getAllUsers();
      this.filteredUsers = [...this.users];
      this.updatePagination();
    } catch (error) {
      console.error('Error loading users:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors du chargement des utilisateurs', 5);
    } finally {
      this.isLoading = false;
    }
  }

  /** Filter users based on search query. */
  public onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(user => 
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );

    this.currentPage = 1; // Reset to first page on search
    this.updatePagination();
  }

  /** Open role edit modal. */
  public openRoleModal(user: any): void {
    this.selectedUser = user;
    this.tempRoles = [...(user.roles || [])];
  }

  /** Close role edit modal. */
  public closeRoleModal(): void {
    this.selectedUser = null;
    this.tempRoles = [];
  }

  /** Toggle a role. */
  public toggleRole(role: string): void {
    const index = this.tempRoles.indexOf(role);
    if (index === -1) {
      this.tempRoles.push(role);
    } else {
      // Ne pas permettre de retirer ROLE_INDIVIDUAL
      if (role !== 'ROLE_INDIVIDUAL') {
        this.tempRoles.splice(index, 1);
      }
    }
  }

  /** Check if a role is selected. */
  public hasRole(role: string): boolean {
    return this.tempRoles.includes(role);
  }

  /** Save role changes. */
  public async saveRoles(): Promise<void> {
    if (!this.selectedUser) return;

    try {
      await this.adminService.updateUserRoles(this.selectedUser.id, this.tempRoles);
      
      // Mettre à jour localement
      this.selectedUser.roles = [...this.tempRoles];
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Rôles mis à jour avec succès', 5);
      this.closeRoleModal();
    } catch (error) {
      console.error('Error updating roles:', error);
      this.alertService.pushAlert(AlertType.ERROR, 'Erreur lors de la mise à jour des rôles', 5);
    }
  }

  /** Open delete confirmation modal. */
  public confirmDelete(user: any): void {
    this.userToDelete = user;
  }

  /** Cancel delete. */
  public cancelDelete(): void {
    this.userToDelete = null;
  }

  /** Delete user. */
  public async deleteUser(): Promise<void> {
    if (!this.userToDelete) return;

    try {
      await this.adminService.deleteUser(this.userToDelete.id);
      
      // Retirer de la liste
      this.users = this.users.filter(u => u.id !== this.userToDelete.id);
      this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.userToDelete.id);
      this.updatePagination();
      
      this.alertService.pushAlert(AlertType.SUCCESS, 'Utilisateur supprimé avec succès', 5);
      this.userToDelete = null;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      let message = 'Erreur lors de la suppression de l\'utilisateur';
      if (error?.status === 403) {
        message = 'Vous ne pouvez pas supprimer votre propre compte';
      } else if (error?.status === 409) {
        // Erreur de contrainte d'intégrité
        message = error?.error?.error || 'Impossible de supprimer cet utilisateur. Il est lié à d\'autres données (annonces, événements, fichiers, etc.).';
      } else if (error?.error?.error) {
        message = error.error.error;
      }
      
      this.alertService.pushAlert(AlertType.ERROR, message, 7);
      this.userToDelete = null;
    }
  }

  /** Get role badge class. */
  public getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-danger';
      case 'ROLE_SERVICE_PROVIDER':
        return 'bg-success';
      case 'ROLE_INDIVIDUAL':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  /** Get role label. */
  public getRoleLabel(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_SERVICE_PROVIDER':
        return 'Prestataire';
      case 'ROLE_INDIVIDUAL':
        return 'Particulier';
      default:
        return role;
    }
  }

  /** Navigate back to dashboard. */
  public goBack(): void {
    this.router.navigate(['/admin']);
  }

  /** Open edit modal. */
  public openEditModal(user: any): void {
    this.userBeingEdited = user;
  }

  /** Close edit modal. */
  public closeEditModal(): void {
    this.userBeingEdited = null;
  }

  /** Handle user saved. */
  public onUserSaved(updatedUser: any): void {
    // Mettre à jour dans la liste
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      this.onSearch(); // Rafraîchir les résultats filtrés
    }
  }

  /** Calculate pagination. */
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    
    // Reset to page 1 if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Calculate start and end indices
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Get paginated users
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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

  //endregion

}