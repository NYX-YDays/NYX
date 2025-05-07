import { Event } from "./event";
import { Ad } from "../../ads/models/ad";

/** Approaches from user */

export class Approach {
    /** Approach ID. */
    public id = NaN;

    /** Approach state. */
    public state = NaN;

    /** Approach date notification. */
    public dateNotif = new Date();

    /** Approach message */
    public message = '';

    /** Ad */
    public ad: Ad = new Ad();

    /** Event */
    public event: Event = new Event();

}