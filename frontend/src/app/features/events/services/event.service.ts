// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { UtilService } from '../../../shared/services/util.service';
import { UserEvent } from '../models/user-event';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService extends UtilService {

  //region fields

  private apiUrl = `${environment.apiUrl}`;

  //endregion

  //region methods

  /**
   * Récupère tous les événements de l'utilisateur connecté
   */
  public getUserEventsAsync(): Promise<UserEvent[]> {
    return this.tryGetAsync(`${this.apiUrl}/user/events`);
  }

  /**
   * Get an event from the current user.
   * @param eventId ID of the event to get.
   * @returns The corresponding event.
   */
  public getUserEventAsync(eventId: number): Promise<UserEvent> {
    return this.tryGetAsync(`${this.apiUrl}/user/event/${eventId}`);
  }

  /**
   * Get events linked to the current user and not linked to an ad.
   * @param adId ID of the add from which to get the events that aren't linked to it.
   * @returns The corresponding user events.
   */
  public getUserEventsNotLinkedToAdAsync(adId: number): Promise<UserEvent[]> {
    return this.tryGetAsync(`${this.apiUrl}/user/events/notLinkedToAd/${adId}`);
  }

  /**
   * Add an event.
   * @param event Event to add.
   * @returns The added event.
   */
  public addEventAsync(event: UserEvent): Promise<UserEvent> {
    return this.tryPostAsync(`${this.apiUrl}/event`, event);
  }

  /**
   * Update an event.
   * @param event Event to update.
   */
  public updateEventAsync(event: UserEvent) {
    return this.tryPutAsync(`${this.apiUrl}/event/${event.id}`, event);
  }

  /**
   * Delete an event.
   * @param eventId ID of the event to delete.
   */
  public deleteEventAsync(eventId: number) {
    return this.tryDeleteAsync(`${this.apiUrl}/event/${eventId}`);
  }

  //endregion

}
