import { Approach } from "./approach";

/** Events from user */

export class Event {

    /** Event ID. */
    public id = NaN;
    
    /** Event title. */
    public title = '';
    
    /** Event description. */
    public description = '';
    
    /** Event date. */
    public dateEvent = new Date();
    
    /** Approaches. */
    public approaches: Approach[] = [];

}