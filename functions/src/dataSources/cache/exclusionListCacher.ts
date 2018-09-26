import { ICache } from "./ICache";

const exclusionListKey: string = "exclusion_list";

export class ExclusionListCacher {
    /**
     * Uses an ICache to create/set a list of excluded orders 
     * identified by their order id. 
     * @param cache Instance of an ICache
     * @param id Id of the order that will be added to the exclusion list
     * @return Gives back the updated list
     */
    static addToExclusionList(cache: ICache, id: string) {
        return cache.getCacheItem<string[]>(exclusionListKey).then(list => {
            if (!list) {
                return cache.setCacheItem(exclusionListKey, [ id ]);
            }
            list.push(id);
            return cache.setCacheItem(exclusionListKey, list);
        });
    }

    /**
     * Retrieves the exclusion list from the cache
     * @param cache Instance of an ICache
     * @return an empty list if list has not yet been set
     *         or failed in retrieval, otherwise it will return the
     *         exclusion list
     */
    static getExclusionList(cache: ICache): Promise<string[]> {
        return cache.getCacheItem<string[]>(exclusionListKey).then(list => {
            if (!list) {
                return [];
            }
            return list;
        });
    }
}