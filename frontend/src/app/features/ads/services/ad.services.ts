import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ad } from '../models/ad';
import { Category } from '../models/category';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AdService {
    private apiUrlAds = `${environment.apiUrl}/ads`;
    private apiUrlAd = `${environment.apiUrl}/ad`;

    constructor(private http: HttpClient) {}

    getAds(params: {category?: number} = {}): Observable<Ad[]> {
        let httpParams = new HttpParams();
        if (params.category) {
            httpParams = httpParams.set('category', params.category.toString());
        }
        return this.http.get<Ad[]>(this.apiUrlAds, { params: httpParams });
    }
    
    getAdById(id: number): Observable<Ad> {
        return this.http.get<Ad>(`${this.apiUrlAd}/${id}`);
    }

    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrlAds.replace('/ads', '/categories')}`);
    }
}