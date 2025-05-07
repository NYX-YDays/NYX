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

  //endregion

}
