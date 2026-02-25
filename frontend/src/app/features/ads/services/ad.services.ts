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

  getAds(categoryId = NaN): Promise<Ad[]> {
    return this.tryGetAsync<Ad[]>(`${this.apiUrl}/ads${!isNaN(categoryId) ? `?category=${categoryId}` : ''}`);
  }

  getAdById(id: number): Promise<Ad> {
    return this.tryGetAsync<Ad>(`${this.apiUrl}/ad/${id}`);
  }

  getAllCategories(): Promise<Category[]> {
    return this.tryGetAsync<Category[]>(`${this.apiUrl}/categories`);
  }

  //endregion

}
