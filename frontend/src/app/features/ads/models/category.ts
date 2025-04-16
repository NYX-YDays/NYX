import { Ad } from './ad';

export class Category {
    /** The category ID */
    public id = NaN;
    
    /** The category title */
    public title = '';
    
    /** Optional ID of an ad this category might be specifically linked to */
    public idAd = NaN;
    
    /** List of ads associated with this category (might not be needed in frontend) */
    public ads: Ad[] = []; 
}