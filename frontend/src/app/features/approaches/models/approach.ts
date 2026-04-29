import { ApproachState } from '../enums/approach-state';
import { Ad } from '../../ads/models/ad';
import { UserEvent } from '../../events/models/user-event';

/** Approach between an ad and an event. */
export class Approach {

  /** Approach ID. */
  public id = NaN;

  /** Approach state. */
  public state = ApproachState.PENDING;

  /** Approach date notification. */
  public dateNotif = new Date();

  /** Approach message */
  public message = '';

  public ad = new Ad();

  public adId = NaN;

  public event = new UserEvent();

  public eventId = NaN;

}
