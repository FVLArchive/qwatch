import { DialogflowApp } from "actions-on-google";

/** 
 * Package that an ICache implementation may need to use to provide 
 * its desired results
 */
export interface ICachePackage {
    app?: DialogflowApp;
}

/** 
 * Cache to handle any logic that will allow for an item to persist
 * temporarily
 */
export interface ICache {
    /**
     * Sets an item in the cache with the provided key
     * @param val the item the user wants to set in cache
     * @param key the string that will be used to find the item that was set by the user in cache
     * @returns the item being set
     */
    setCacheItem<T>(key: string, val: T): Promise<T>;
    
    /**
     * Retrieves an item stored in the cache based off the provided key
     * @param key the string used to find the item that was set by the user in cache
     * @returns the item tied to the key if it exists 
     */
    getCacheItem<T>(key: string): Promise<T>;
}

