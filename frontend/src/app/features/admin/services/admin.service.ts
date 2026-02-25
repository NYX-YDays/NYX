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

    // ==================== USERS ====================

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

    // ==================== ADS ====================

    /**
     * Get all ads.
     * @returns List of all ads.
     */
    public async getAllAds(): Promise<any[]> {
      return this.tryGetAsync(`${this.apiUrl}/admin/ads`);
    }

    /**
     * Get a specific ad by ID.
     * @param adId Ad ID
     * @returns Ad details
     */
    public async getAd(adId: number): Promise<any> {
      return this.tryGetAsync(`${this.apiUrl}/admin/ads/${adId}`);
    }

    /**
     * Update ad information.
     * @param adId Ad ID
     * @param adData Ad data to update
     * @returns Updated ad
     */
    public async updateAd(adId: number, adData: any): Promise<any> {
      return this.tryPutAsync(`${this.apiRootUrl}/admin/ads/${adId}`, adData, true);
    }

    /**
     * Toggle ad verification status.
     * @param adId Ad ID
     * @param isVerified Verification status
     * @returns Updated ad
     */
    public async toggleAdVerification(adId: number, isVerified: boolean): Promise<any> {
      return this.tryPutAsync(`${this.apiRootUrl}/admin/ads/${adId}/verify`, { isVerified }, true);
    }

    /**
     * Delete an ad (admin only).
     * @param adId Ad ID to delete
     */
    public async deleteAd(adId: number): Promise<void> {
      return this.tryDeleteAsync(`${this.apiRootUrl}/admin/ads/${adId}`);
    }

    /**
     * Get all categories.
     * @returns List of all categories.
     */
    public async getAllCategories(): Promise<any[]> {
      return this.tryGetAsync(`${this.apiUrl}/categories`);
    }

    // ==================== EVENTS ====================

    /**
     * Get all events.
     * @returns List of all events.
     */
    public async getAllEvents(): Promise<any[]> {
      return this.tryGetAsync(`${this.apiUrl}/admin/events`);
    }

    /**
     * Get a specific event by ID.
     * @param eventId Event ID
     * @returns Event details
     */
    public async getEvent(eventId: number): Promise<any> {
      return this.tryGetAsync(`${this.apiUrl}/admin/events/${eventId}`);
    }

    /**
     * Update event information.
     * @param eventId Event ID
     * @param eventData Event data to update
     * @returns Updated event
     */
    public async updateEvent(eventId: number, eventData: any): Promise<any> {
      return this.tryPutAsync(`${this.apiRootUrl}/admin/events/${eventId}`, eventData, true);
    }

    /**
     * Delete an event (admin only).
     * @param eventId Event ID to delete
     */
    public async deleteEvent(eventId: number): Promise<void> {
      return this.tryDeleteAsync(`${this.apiRootUrl}/admin/events/${eventId}`);
    }

    //endregion
}