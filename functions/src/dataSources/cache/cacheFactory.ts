import { ICachePackage, ICache } from "./ICache";
import { DialogFlowV1Cache } from "./dialogFlowV1Cache"

export class CacheFactory {
    /**
     * Chooses the appropriate ICache based off the content(s) 
     * of the ICachePackage input
     * @param input Instance of an ICachePackage
     * @returns Instance of an ICache or null if the function is unable to use
     *          the contents of ICachePackage to decide what implementation of ICache to choose 
     */
    static getCache(input: ICachePackage): Promise<ICache> {
        if (input.app) {
            return Promise.resolve(new DialogFlowV1Cache(input.app));
        }
        // will return null upon bad package, but can be replaced with a
        // default instead
        return Promise.resolve(null);
    }
}