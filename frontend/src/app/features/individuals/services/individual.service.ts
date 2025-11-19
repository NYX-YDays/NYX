import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Individual } from '../models/individual';
import { UtilService } from '../../../shared/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class IndividualService extends UtilService {

  //region fields

  /** Authentication route URL. */
  protected readonly apiUrl = `${environment.apiUrl}/user`;

  //endregion

  //region methods

  /** @returns Get the currently authenticated individual. */
  public getCurrentIndividual(): Promise<Individual> {
    return this.tryGetAsync(`${this.apiUrl}`);
  }

  /**
   * Update the current individual's profile.
   * @param userId The user ID.
   * @param data The updated individual data.
   * @returns The updated individual.
   */
  public updateIndividual(userId: number, data: any): Promise<Individual> {
    return this.tryPutAsync(`${this.apiUrl}/${userId}`, data, true);
  }

  //endregion

}
