import { Injectable } from '@angular/core';
import { Ad } from '../models/ad';
import { Category } from '../models/category';
import { environment } from '../../../../environments/environment';
import { UtilService } from '../../../shared/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class AdService extends UtilService {

  //region fields

  private apiUrl = environment.apiUrl;

  //endregion

  //region methods

  public getAds(categoryId = NaN): Promise<Ad[]> {
    return this.tryGetAsync<Ad[]>(`${this.apiUrl}/ads${!isNaN(categoryId) ? `?category=${categoryId}` : ''}`);
  }

  /** Get the ads published by the current user. */
  public getCurrentUserAdsAsync(): Promise<Ad[]> {
    return this.tryGetAsync<Ad[]>(`${this.apiUrl}/user/ads`);
  }

  public getAdByIdAsync(id: number): Promise<Ad> {
    return this.tryGetAsync<Ad>(`${this.apiUrl}/ad/${id}`);
  }

  public getAllCategoriesAsync(): Promise<Category[]> {
    return this.tryGetAsync<Category[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Add an ad.
   * @param ad Ad to add.
   * @returns The added ad.
   */
  public addAdAsync(ad: Ad): Promise<Ad> {
    return this.tryPostAsync(`${this.apiUrl}/ad`, ad);
  }

  /**
   * Update an ad.
   * @param ad Ad to update.
   */
  public updateAdAsync(ad: Ad) {
    return this.tryPutAsync(`${this.apiUrl}/ad/${ad.id}`, ad);
  }

  /**
   * Delete an ad.
   * @param adId ID of the ad to delete.
   */
  public deleteAdAsync(adId: number) {
    return this.tryDeleteAsync(`${this.apiUrl}/ad/${adId}`);
  }

  //endregion

}
