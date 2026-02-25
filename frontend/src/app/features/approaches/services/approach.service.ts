import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Approach } from '../models/approach';
import { UtilService } from '../../../shared/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class ApproachService extends UtilService {

  //region fields

  /** Get notified when the count of pending approaches linked to the current user's ads changed. */
  public readonly onPendingApproachCountChanged = new EventEmitter<number>();

  /** API URL. */
  private readonly apiUrl = `${environment.apiUrl}/approach`;

  /** API URL to get current user's approaches. */
  private readonly userApproachesApiUrl = `${environment.apiUrl}/user/approaches`;

  //endregion

  //region methods

  /**
   * Get the current user's approaches.
   * @returns The corresponding approaches.
   */
  public getUserApproachesAsync(): Promise<Approach[]> {
    return this.tryGetAsync(this.userApproachesApiUrl);
  }

  /**
   * Get the number of pending approaches linked to the current user's ads.
   * @returns The number of corresponding approaches.
   */
  public getUserPendingApproachCountAsync(): Promise<number> {
    return this.tryGetAsync(`${this.userApproachesApiUrl}/pending/count`);
  }

  /**
   * Get an approach.
   * @param approachId ID of the approach to get.
   * @returns The corresponding approach.
   */
  public getApproachAsync(approachId: number): Promise<Approach> {
    return this.tryGetAsync(`${this.userApproachesApiUrl}/${approachId}`);
  }

  /**
   * Add an approach.
   * @param approach Approach to add.
   */
  public addApproachAsync(approach: Approach) {
    return this.tryPostAsync(this.apiUrl, approach);
  }

  /**
   * Update an approach.
   * @param approach Approach to update.
   */
  public updateApproachAsync(approach: Approach) {
    return this.tryPutAsync(`${this.apiUrl}/${approach.id}`, approach);
  }

  //endregion

}
