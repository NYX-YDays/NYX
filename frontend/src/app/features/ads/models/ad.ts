import { Category } from "./category";
import { AdUser } from "./aduser";

/** Ads */

export class Ad {

    /** The ad ID. */
    public id = NaN;

    /** The user who created the ad */
    public user: AdUser | null = null;

    /** The ad title */
    public title = '';

    /** The ad description */
    public description = '';

    /** The creation date of the ad */
    public dateAd = new Date();

    /** The publication date of the ad */
    public datePublicationAd = new Date();

    /** The price indication of the ad */
    public priceIndication = '';

    /** Whether the ad is verified */
    public isVerified = false;

    /** Categories associated with this ad */
    public categories: Category[] = [];

}
