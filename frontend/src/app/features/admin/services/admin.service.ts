import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UtilService } from '../../../shared/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends UtilService {

    //region fields

    /** Authentication route URL. */
      protected readonly apiUrl = `${environment.apiUrl}`;

    //endregion

    //region methods

    /**
     * Get admin dashboard statistics.
     * @returns Dashboard statistics (userCount, adCount, eventCount)
     */
    public async getStatistics(): Promise<{ userCount: number; adCount: number; eventCount: number }> {
        return this.tryGetAsync(`${this.apiUrl}/admin/stats`);
    }

    /**
     * Get all users.
     * @returns List of all users.
     */ 
    public async getAllUsers(): Promise<any[]> {
      return this.tryGetAsync(`${this.apiUrl}/admin/users`);
    }

    /**
     * Get a specific user by ID.
     * @param userId User ID
     * @returns User details
     */
    public async getUser(userId: number): Promise<any> {
      return this.tryGetAsync(`${this.apiUrl}/admin/users/${userId}`);
    }

    /**
     * Update user information.
     * @param userId User ID
     * @param userData User data to update
     * @returns Updated user
     */
    public async updateUser(userId: number, userData: any): Promise<any> {
      return this.tryPutAsync(`${this.apiRootUrl}/admin/users/${userId}`, userData, true);
    }

    /**
     * Update user roles.
     * @param userId User ID
     * @param roles Array of roles
     * @returns Updated user
     */
    public async updateUserRoles(userId: number, roles: string[]): Promise<any> {
      return this.tryPutAsync(`${this.apiRootUrl}/admin/users/${userId}/roles`, { roles }, true);
    }

    /**
     * Delete a user (admin only).
     * @param userId User ID to delete
     */
    public async deleteUser(userId: number): Promise<void> {
      return this.tryDeleteAsync(`${this.apiRootUrl}/admin/users/${userId}`);
    }

    //endregion
}