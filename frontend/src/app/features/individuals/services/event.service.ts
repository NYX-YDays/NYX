// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import { UtilService } from '../../../shared/services/util.service';
import { Event } from '../models/event';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private utilService: UtilService) { }

    /**
     * Récupère tous les événements de l'utilisateur connecté
     */
    async getUserEvents(): Promise<Event[]> {
    return await this.utilService.tryGetAsync(`${this.apiUrl}/user/events`);
    }

    /**
     * Ajoute un nouvel événement
     */
    async addEvent(event: { title: string, description: string }): Promise<Event> {
    const currentUser = this.utilService.getCurrentUserIdentity();
    if (!currentUser) {
        throw new Error('User not authenticated');
    }

    const data = {
        ...event,
        user: currentUser.id
    };

    return await this.utilService.tryPostAsync(`${this.apiUrl}/event`, data);
    }

    /**
     * Met à jour un événement existant
     */
    async updateEvent(eventId: number, event: { title?: string, description?: string }): Promise<Event> {
    return await this.utilService.tryPutAsync(`${this.apiUrl}/event/${eventId}`, event, true);
    }

    /**
     * Supprime un événement
     */
    async deleteEvent(eventId: number): Promise<void> {
    return await this.utilService.tryDeleteAsync(`${this.apiUrl}/event/${eventId}`);
    }
}