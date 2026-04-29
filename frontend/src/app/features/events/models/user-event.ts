import { Approach } from "../../approaches/models/approach";

/** Events from user */

export class UserEvent {

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
